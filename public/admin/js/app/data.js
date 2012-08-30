(function() {
  var EventEmitter, bucket, bucketName, data, path, promises, s3, _;

  EventEmitter = require('events').EventEmitter;

  promises = require('../lib/promises');

  _ = require('underscore');

  s3 = require('../lib/s3').s3;

  bucketName = location.hash.replace(/^#\/([^\/]+).*/, '$1');

  path = '/' + bucketName + '/admin/';

  bucket = null;

  data = module.exports = _.extend(new EventEmitter, {
    collections: {},
    get: function(url) {
      return bucket.get('api/' + url);
    },
    put: function(url, data) {
      return bucket.put('api/' + url, data);
    },
    destory: function(url) {
      return bucket.destroy('api/' + url);
    },
    refresh: function(options) {
      var deferred, promise;
      deferred = new promises.Deferred();
      promise = deferred.promise;
      bucket.list('api/').then(function(results) {
        var collection, has, ids, remove, type, urlExp, _results;
        urlExp = /^api\/(\w+)\/(\w+)$/;
        has = {};
        results.contents.forEach(function(item) {
          var collection, full, id, match, type;
          match = item.key.match(urlExp);
          if (!match) {
            return;
          }
          full = match[0], type = match[1], id = match[2];
          if (!data.collections.hasOwnProperty(type)) {
            return;
          }
          collection = data.collections[type];
          if (!has[type]) {
            has[type] = {};
          }
          has[type][id] = true;
          if (collection.get(id) && collection.get(id).etag === item.etag) {
            return;
          }
          return promise = promise.then(bucket.get(item.key).then(function(data) {
            data = JSON.parse(data);
            data.id = id;
            if (collection.get(id)) {
              return collection.get(id).set(data, options).etag = item.etag;
            } else {
              return collection.add(data, options).get(id).etag = item.etag;
            }
          }, function(error) {
            return console.error(error);
          }));
        });
        _results = [];
        for (type in has) {
          ids = has[type];
          remove = [];
          collection = data.collections[type];
          collection.each(function(item) {
            if (!ids[item.id]) {
              return remove.push(item);
            }
          });
          _results.push(collection.remove(remove, options));
        }
        return _results;
      }, deferred.fail);
      return promise.then(function() {
        return data;
      });
    },
    auth: function() {
      var creds;
      creds = sessionStorage.getItem('creds') || localStorage.getItem('creds');
      if (creds) {
        creds = creds.split(':');
        this.username = creds.shift();
        s3.auth(creds.shift(), creds.shift());
        bucket = s3.bucket(bucketName);
        return true;
      } else {
        return false;
      }
    }
  });

}).call(this);
