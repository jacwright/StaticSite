
var cookie = exports.extend({
	set: function(name, value, expires, path, secure) {
		document.cookie = name + '=' + encodeURI(value) +
        ((expires) ? ';expires=' + (typeof expires == 'number' ? new Date(expires) : expires).toGMTString() : '') +
		((path) ? ';path=' + path : ';path=/') + 
		((secure) ? ';secure' : '');
	},
	
	get: function(name) {
		var cookies = cookie.open();
		return cookies[name];
	},
	
	remove: function(name, path) {
		cookie.set(name, '', new Date(0), path);
	},
	
	open: function() {
		var cookies = {};
		var items = document.cookie.split('; ');
		for (var i = 0; i < items.length; i++) {
			var theCookie = items[i].split('=');
			cookies[theCookie[0]] = decodeURI(theCookie[1]);
		}
		return cookies;
	}
});
