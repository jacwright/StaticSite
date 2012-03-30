
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
			
			@bind 'change:selected', (collection, selected) -> @selectedIndex = @indexOf selected
			@bind 'change:selectedIndex', (collection, index) -> @selected = @at index
		
		
		query: (field) ->
			query.select(@models).where(field)
		