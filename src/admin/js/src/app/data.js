var EventEmitter = require('events').EventEmitter,
	promises = require('../libs/promises'),
	_ = require('underscore'),
	s3 = require('../libs/s3').s3;


var bucket,
	bucketName = location.pathname.replace(/^\/([^\/]+).*/, '$1'),
	path = '/' + bucketName + '/admin/';


var data = module.exports = _.extend(new EventEmitter, {
	
	collections: {},
	
	get: function(url) {
		return bucket.get('api/' + url);
	},
	
	put: function(url, data) {
		return bucket.put('api/' + url, data);
	},
	
	destory: function(url) {
		return bucket.destory('api/' + url);
	},
	
	refresh: function(options) {
		var deferred = new promises.Deferred();
		var promise = deferred.promise;
		
		bucket.list('api/').then(function(results) {
			var urlExp = /^api\/(\w+)\/(\w+)$/;
			var has = {};
			
			
			results.contents.forEach(function(item) {
				var match = item.key.match(urlExp);
				if (!match) return;
				var id = match[2];
				var type = match[1];
				if (!data.collections.hasOwnProperty(type)) return;
				
				var collection = data.collections[type];
				if (!has[type]) has[type] = {};
				
				has[type][id] = true;
				
				// if we have it and it is up-to-date, don't load it.
				if (collection.get(id) && collection.get(id).etag == item.etag) return;
				
				// queue up all the calls so that the final promise won't be done until all of these are.
				promise = promise.then(bucket.get(item.key).then(function(data) {
					data = JSON.parse(data);
					data.id = id; // just in case it hadn't been set
					if (collection.get(id)) {
						collection.get(id).set(data, options).etag = item.etag;
					} else {
						collection.add(data, options).get(id).etag = item.etag;
					}
				}, function(error) {
					console.error(error);
				}));
			});
			
			// remove deleted items
			for (var type in has) {
				var remove = [];
				var ids = has[type];
				var collection = data.collections[type];
				collection.each(function(item) {
					if (!ids[item.id]) remove.push(item);
				});
				collection.remove(remove, options);
			}
			
		}, deferred.fail);
		
		// return the data object as the promise result from this call
		return promise.then(function() {
			return data;
		});
	},
	
	auth: function() {
		var creds = sessionStorage.getItem('creds') || localStorage.getItem('creds');
		if (creds) {
			creds = creds.split(':');
			this.username = creds.shift();
			s3.auth(creds.shift(), creds.shift());
			return true;
		} else {
			return false;
		}
	}
});
