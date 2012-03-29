
define ['lib/promises', 'lib/backbone'], (promises) ->
	
	# these are reserved, properties that get set in the set() method which would cause an infinite loop
	reservedAttrs = id: true, _changed: true, _setting: true, _moreChanges: true
	
	
	class Model extends Backbone.Model
		
		
		constructor: (attributes, options) ->
			super(attributes, options)
			@fields = {}
		
		# define a property on this prototype with Object.defineProperty
		@def: (property, definition) -> Object.defineProperty(@::, property, definition)
		
		# define a backbone attribute getter/setter
		@attr: (property, defaultValue) ->
			throw new Error("'#{property}' is a reserved name and cannot be declared as a Backbone attribute") if reservedAttrs[property]
			
			if arguments.length > 1
				@::defaults = {} unless @::defaults
				@::defaults[property] = defaultValue
			
			@def property,
				get: -> @attributes[property]
				set: (value) ->
					return if value is @attributes[property]
					changes = {}
					changes[property] = value
					@set changes
		
		# define a property that is not an attribute but will trigger change events
		@prop: (property) ->
			@def property,
				get: -> @fields[property]
				set: (value) ->
					oldValue = @fields[property]
					return if value is oldValue
					@fields[property] = value
					@trigger 'change:' + property, this, value, oldValue: oldValue
		
		
	
	
	
	# set up backbone server sync
#	Backbone.sync = (method, model, options) ->
#		url = options.url ? if typeof model.url is 'function' then model.url() else model.url
#		url = Model.url(url, options.params) if options.params
#		
#		promise = switch method
#			when 'read'
#			when 'create'
#			when 'update' then Model.put(url, model)
#			when 'delete' then Model.del(url)
#		
#		
#		promise.fulfilled options.success if options.success
#		promise.failed options.error if options.error
#		promise.then (response) -> promises.args(model, response) # return to the promise the model or collection the operation was called on
	
	
	# add make method to promises to convert data to its model
	promises.Promise::make = (ModelClass) ->
		@then (args...) ->
			args.isArgs = true
			if args[0] instanceof Array	
				args[0][i] = new ModelClass(item) for item, i in args[0]
			else
				args[0] = new ModelClass(args[0])
			args
	
	
	return Model