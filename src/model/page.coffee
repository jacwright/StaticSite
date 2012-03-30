define ['./file'], (File) ->
	
	
	class Page extends File
		
		icon: 'layout'
		
		descendents: ->
			path = @id + '/'
			@collection.query('id').startsWith(path).end()
		
		anscestors: (id) ->
			ids = []
			parts = id.replace(/\/$/, '').split('/')
			parts.pop()
			
			while parts.length
				ids.push(parts.join('/'))
				parts.pop()
			
			query('id').within(ids).on(this.models)
	
	
	
	return Page
	