query = require('../lib/query')
Model = require('Backbone').Model
Collection = require('Backbone').Collection


class Page extends Model
	

module.exports = exports = Page

class Pages extends Collection
	model: Page
	
	getByPath: (path) ->
		query('path').is(path).on(this.models)
	
	getChildrenOf: (path) ->
		query('path').startsWith(path).on(this.models)
	
	getParentsOf: (path) ->
		paths = []
		parts = path.replace(/\/$/, '').split('/')
		parts.pop()
		
		while parts.length
			paths.push(parts.join('/'))
			parts.pop()
		
		query('path').within(paths).on(this.models)


alert(Pages)
exports.Pages = Pages
exports.collection = new Pages()
