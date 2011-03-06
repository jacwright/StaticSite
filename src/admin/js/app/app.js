var Cookie = require('cookie'),
	Backbone = require('backbone'),
	data = require('data'),
	pages = require('pages');


// ensure we are at the correct domain
if (location.protocol != 'https:' || location.host != 's3.amazonaws.com') {
	location.href = 'https://s3.amazonaws.com/' + location.host + location.pathname + (location.pathname.slice(0, 1) == '/' ? 'index.html' : '');
	return;
}

if (!pages.at('login')) {
	data.auth().failed(function() {
		location.hash = '#/login';
	});
}

