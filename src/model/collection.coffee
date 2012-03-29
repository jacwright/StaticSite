
define ['./model', 'lib/backbone'], (Model) ->
	
	class Collection extends Backbone.Collection
		
		model: Model
		@def: Model.def
		@prop: Model.prop
		
		@prop 'selected'
		@prop 'selectedIndex'
		
		constructor: (models, options) ->
			@model = options.model if options?.model
			
			super(models, options)
			@fields =
				selected: null
				selectedIndex: -1
			
			@bind 'change:selected', (collection, selected) -> @selectedIndex = @indexOf selected
			@bind 'change:selectedIndex', (collection, index) -> @selected = @at index
		
	