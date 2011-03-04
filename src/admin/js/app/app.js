var Cookie = require('cookie'),
	Backbone = require('backbone'),
	pages = require('pages').pages;


// ensure we are at the correct domain
if (!location.protocol == 'file:' && (location.protocol != 'https:' || location.host != 's3.amazonaws.com')) {
	location.href = 'https://s3.amazonaws.com/' + location.host + location.pathname + (location.pathname.slice(0, 1) == '/' ? 'index.html' : '');
	return;
}


