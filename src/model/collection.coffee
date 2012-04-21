
define ['./model', 'lib/array-query', 'lib/backbone'], (Model, query) ->
	
	
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
		
		
		query: (field) ->
			query.select(@models).where(field)
		
		
		trigger: (event, args...) ->
			super(event, args...)
			if args[args.length - 1] isnt 'cloned'
				if event is 'change:selected' 
					@selectedIndex = @indexOf @selected
				else if event is 'change:selectedIndex'
					@selected = @at @selectedIndex
			