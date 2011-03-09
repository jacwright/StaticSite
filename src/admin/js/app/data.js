var transport = require('transport'),
	cookie = require('cookie'),
	sha1 = require('crypto').sha1,
	aes = require('crypto').aes,
	uuid = require('crypto').uuid,
	when = require('promise').when,
	Backbone = require('backbone');
	Deferred = require('promise').Deferred,
	s3 = require('s3').s3;


var bucket,
	bucketName = location.pathname.replace(/^\/([^\/]+).*/, '$1'),
	path = '/' + bucketName + '/admin/';


var data = exports.extend(Backbone.Events, {
	
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
		var deferred = new Deferred();
		var promise = deferred.promise;
		
		bucket.list('api/').then(function(results) {
			var urlExp = /^api\/(\w+)\/(\w+)$/;
			var has = {};
			
			
			results.contents.forEach(function(item) {
				var match = item.key.match(urlExp);
				if (!match) return;
				try {
					var id = match[2];
					var type = match[1];
					var collection = data.collections[type];
					if (!has[type]) has[type] = {};
				} catch(e) {
					return;
				}
				
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
		var session = cookie.get('session');
		var remember = cookie.get('rememberme');
		if (remember && remember != 'true') {
			remember = remember.split(':');
			return this.login(remember[0], remember[1], true, true);
		} else if (session) {
			session = session.split(':');
			return this.login(session[0], session[1], false, true);
		}
		return new Deferred().fail().promise;
	},
	
	login: function(username, password, remember, prehashed) {
		var deferred = new Deferred();
		if (!prehashed) {
			username = sha1(username);
			password = sha1(password);
		}
		if (remember) {
			cookie.set('rememberme', username + ':' + password, thirtyDays(), path, true);
		} else {
			cookie.remove('rememberme', path);
		}
		
		cookie.set('session', username + ':' + password, null, path, true); // browser session only
		
		$.get('../api/auth/' + username).then(function(cypher) {
			var values = aes.decrypt(cypher, password, 256).split(':');
			
			if (values.length == 3 && values[0] == username) {
				s3.auth(values[1], values[2]);
				bucket = s3.bucket(bucketName);
				bucket.list('api/auth/' + username).then(function() {
					deferred.fulfill();
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

function thirtyDays() {
	return new Date().getTime() + 86400000 * 30;
}