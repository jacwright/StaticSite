var Class = require('class').Class,
	query = require('query').query,
	Model = require('Backbone').Model,
	Collection = require('Backbone').Collection;


var Page = exports.Page = new Class({
	extend: Model
	
	
});

var Pages = exports.Pages = new Class({
	extend: Collection,
	model: Page,
	url: 'api/pages',
	
	getByPath: function(path) {
		return query('get("path")').is(path).on(this.models);
	},
	
	getChildrenOf: function(path) {
		return query('get("path")').startsWith(path).on(this.models);
	},
	
	getParentsOf: function(path) {
		var paths = [], parts = path.replace(/\/$/, '').split('/');
		parts.pop();
		
		while (parts.length) {
			paths.push(parts.join('/'));
			parts.pop();
		}
		return query('get("path")').within(paths).on(this.models);
	}
});
alert(Pages);
exports.pages = new Pages();