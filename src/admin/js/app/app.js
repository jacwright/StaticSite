var cookie = require('cookie'),
	data = require('data'),
	Collection = require('Backbone').Collection,
	screens = require('screens');


// ensure we are at the correct domain
if (location.protocol != 'https:' || location.host != 's3.amazonaws.com') {
	location.href = 'https://s3.amazonaws.com/' + location.host + location.pathname + (location.pathname.slice(0, 1) == '/' ? 'index.html' : '');
	throw new Error('Cannot administer site from this location.');
}


data.bind('login', setup);


if (!screens.at('login')) {
	data.auth().then(function() {
		if (!location.hash) screens.go('dashboard');
	}, function() {
		screens.go('login');
	});
}


function setup() {
	
	// create main app collections
	var col = data.collections;
	col.pages = createCollection('pages');
	col.templates = createCollection('templates');
	col.content = createCollection('content');
	col.plugins = createCollection('plugins');
	
	// load the data
	return data.refresh({ silent: true })
			.get('collections').get('plugins').then(initPlugins);
}


function initPlugins(plugins) {
	
	plugins.forEach(function(plugin) {
		if (plugin.active) require(plugin.moduleId);
	});
	return data;
}



function createCollection(key) {
	var data;
	if (typeof localStorage !== 'undefined') data = localStorage.getItem(key) || undefined;
	return new Collection(data, { url: 'api/' + key });
}