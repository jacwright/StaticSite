var cookie = require('cookie'),
	data = require('data'),
	screens = require('screens');


// ensure we are at the correct domain
if (location.protocol != 'https:' || location.host != 's3.amazonaws.com') {
	location.href = 'https://s3.amazonaws.com/' + location.host + location.pathname + (location.pathname.slice(0, 1) == '/' ? 'index.html' : '');
	throw new Error('Cannot administer site from this location.');
}

if (!screens.at('login')) {
	data.auth().then(function() {
		if (!location.hash) screens.go('dashboard');
	}, function() {
		screens.go('login');
	});
}
