
define ['./model', 'lib/array-query', 'lib/backbone'], (Model, query) ->
	
	
	proxy = (event, args...) ->
		@trigger event, args...
	
	
	class Collection extends Backbone.Collection
		
		model: Model
		@def: Model.def
		@prop: Model.prop
		
		@prop 'selected'
		@prop 'selectedIndex'
		
		constructor: (models, options) ->
			super(models, options)
			@fields =
				selected: null
				selectedIndex: -1
		
		
		become: (collection) ->
			@_became = collection
			
			# make the models arrays the same so they stay in sync
			@models = collection.models
			@fields = collection.fields
			@length = collection.length
			@_byId = collection._byId
			@_byCid = collection._byCid
			@add = collection.add.bind(collection)
			@remove = collection.remove.bind(collection)
			
			# proxy events across
			collection.on 'all', proxy, this
			
			# update listeners that the collection is new
			@trigger 'reset', @, {}
		
		unbecome: ->
			collection = @_became
			if collection
				delete @add
				delete @remove
				collection.off 'all', proxy, this
			
		
		
		query: (field) ->
			query.select(@models).where(field)
		
		
		trigger: (event, args...) ->
			super(event, args...)
			if args[args.length - 1] isnt 'cloned'
				if event is 'change:selected' 
					@selectedIndex = @indexOf @selected
				else if event is 'change:selectedIndex'
					@selected = @at @selectedIndex
			