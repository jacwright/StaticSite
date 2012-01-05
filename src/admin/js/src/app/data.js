var crypto = require('../libs/crypto'),
	sha1 = crypto.sha1,
	aes = crypto.aes,
	EventEmitter = require('events').EventEmitter,
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
		// TODO remove the creds until window.unload so that JS plugins won't have access to them
		var creds = sessionStorage.getItem('creds') || localStorage.getItem('creds');
		if (creds) {
			s3.auth(creds.split(':'));
			return true;
		} else {
			return false;
		}
	},
	
	login: function(username, password, remember, prehashed) {
		var deferred = new promises.Deferred();
		if (!prehashed) {
			username = sha1(username);
			password = sha1(password);
		}
		
		$.get('../api/auth/' + username).then(function(cypher) {
			var values = aes.decrypt(cypher, password, 256).split(':');
			
			if (values.length == 3 && values[0] == username) {
				s3.auth(values[1], values[2]);
				var creds = values[1] + ':' + values[2];
				bucket = s3.bucket(bucketName);
				bucket.list('api/auth/' + username).then(function() {
					deferred.fulfill();
					
					sessionStorage.setItem('creds', creds);
					
					if (remember) localStorage.setItem('creds', creds);
					
					data.trigger('login');
				}, function(error) {
					deferred.fail(error);
				});
			} else {
				deferred.fail(new Error('Incorrect Password'));
			}
		}, function() {
			deferred.fail(new Error('Incorrect Username'));
		});
		return deferred.promise;
	},
	
	logout: function() {
		if (cookie.get('rememberme')) {
			// remove their rememberme, but set the preference to remember
			cookie.set('rememberme', 'true', thirtyDays(), path, true);
		}
		cookie.remove('session', path);
		s3.auth(null, null);
		data.trigger('logout');
	},
	
	register: function(key, secret, username, password) {
		s3.auth(key, secret);
		bucket = s3.bucket(bucketName);
		username = sha1(username);
		password = sha1(password);
		var cypher = aes.encrypt([username, key, secret].join(':'), password, 256);
		
		// if we can successfully put this file to the bucket then we have access and are logged in
		return bucket.put('api/auth/' + username, cypher, { acl: 'public-read' });
	},
	
	parseUrl: function(url, params) {
		return this.addQueryParams(base + url, params);
	},
	
	addQueryParams: function(url, params) {
		var query = [];
		
		for (var i in params) {
			if (!params.hasOwnProperty(i)) continue;
			query.push(i + '=' + encodeURIComponent(params[i]));
		}
		
		if (query.length) {
			url += (url.indexOf('?') != -1 ? '&' : '?') + query.join('&');
		}
		return url;
	}
	
});
