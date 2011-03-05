var transport = require('transport'),
	cookie = require('cookie'),
	sha1 = require('crypto').sha1,
	aes = require('crypto').aes,
	when = require('promise').when,
	Deferred = require('promise').Deferred,
	s3 = require('s3').s3;


var bucket,
	bucketName = location.pathname.replace(/^\/([^\/]+).*/, '$1');


var data = exports.extend({
	
	
	get: function(url, params) {
		
	},
	
	put: function(url, body, params) {
		
	},
	
	post: function(url, body, params) {
		
	},
	
	destory: function(url, params) {
		
	},
	
	auth: function() {
		var remember = cookie.get('rememberme');
		if (remember) {
			remember.split(':');
			return this.login(remember[0], remember[1], true, true);
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
			cookie.set('rememberme', username + ':' + password, new Date().getTime() + 86400000 * 30, '/admin/', true); // 30 days
		}
		$.get('../api/auth/' + username).then(function(cypher) {
			var values = aes.decrypt(cypher, password, 256).split(':');
			
			if (values.length == 3 && values[0] == username) {
				s3.auth(values[1], values[2]);
				bucket = s3.bucket(bucketName);
				bucket.list('api/auth/' + username).then(function() {
					deferred.fulfill();
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
		cookie.remove('rememberme');
		s3 = null;
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
