define ->	
	
	# The promise of a an action to be fulfilled with methods to respond to that action after it is finished. The action
	# may happen synchronously or asynchronously.
	
	class Promise
		
		# Allows responding to an action once it is fulfilled or has failed. Allows responding to progress updates as well.
		# A promise may or may not choose to provide progress updates.
		
		then: (fulfilledHandler, failedHandler, progressHandler, cancelHandler) ->
			throw new TypeError 'The Promise base class is abstract, this function is overwritten by the promise\'s deferred object'
		
		
		# Specific method for only passing a fulfilled handler.
		
		fulfilled: (handler) ->
			@then handler
		
		
		# Specific method for only passing a failed handler.
		
		failed: (handler) ->
			@then null, handler
		
		
		# Specific method for only passing a finished handler.
		
		finished: (handler) ->
			@then handler, handler
		
		
		# Specific method for only passing a progress handler.
		
		progress: (handler) ->
			@then null, null, handler
		
		
		# Specific method for only passing a canceled handler.
		
		canceled: (handler) ->
			@then null, null, null, handler
		
		
		
		# Apply the promise's result array to the handler optionally providing a context. 
		# 
		# @param handler Fulfilled handler
		# @param [context] Optional context object
		
		apply: (handler, context) ->
			@then (result) ->
				if (result instanceof Array) handler.apply context, result
				else handler.call context, result
			
		
		
		
		# Allows the cancellation of a promise. Some promises are cancelable and so this method may be created on
		# subclasses of Promise to allow a consumer of the promise to cancel it.
		# 
		# @return {String|Error} Error string or object to provide to failedHandlers
		
		cancel: -> @prev?.cancel()
	
		
		# A shortcut to return the value of a property from the returned promise results. The same as providing your own
		# <code>promise.then (obj) -> obj.propertyName</code> method.
		# 
		# @param {String} propertyName The name of the property to return
		# @return {Promise} The new promise for the property value
		
		get: (propertyName) ->
			@then (object) ->
				object[propertyName]
			
		
		
		
		# A shortcut to set the property from the returned promise results to a certain value. The same as providing your
		# own <code>promise.then (obj) -> obj.propertyName = value; return obj</code> method. This returns the
		# original promise results after setting the property as opposed to <code>put</code> which returns the value which
		# was set.
		# 
		# @param {String} propertyName The name of the property to set
		# @param {mixed} value The value for the property to be set to
		# @return {Promise} A new promise with the original results
		
		set: (propertyName, value) ->
			@then (object) ->
				object[propertyName] = value
				object
		
		
		
		# A shortcut to set the property from the returned promise results to a certain value. The same as providing your
		# own <code>promise.then (obj) -> return obj.propertyName = value</code> method. This returns the new value
		# after setting the property as opposed to <code>set</code> which returns the original promise results.
		# 
		# @param {String} propertyName The name of the property to set
		# @param {mixed} value The value for the property to be set to
		# @return {Promise} A new promise with the value
		
		put: (propertyName, value) ->
			@then (object) ->
				object[propertyName] = value
		
		
		
		# A shortcut to call a method on the returned promise results. The same as providing your own
		# <code>promise.then (obj) -> obj.functionName(); return obj</code> method. This returns the original results
		# after calling the function as opposed to <code>call</code> which returns the function's results.
		# 
		# @param {String} functionName The name of the function to call
		# @param {mixed} [...arguments] Zero or more arguments to pass to the function
		# @return {Promise} A new promise with the original results
		
		run: (functionName, params...) ->
			@then (object) ->
				object[functionName] params...
				object
		
		
		
		# A shortcut to call a method on the returned promise results. The same as providing your own
		# <code>promise.then (obj, rest...) -> obj.functionName rest...</code> method. This returns the function's results
		# after calling the function as opposed to <code>run</code> which returns the original results.
		# 
		# @param {String} functionName The name of the function to call
		# @param {mixed} [...arguments] Zero or more arguments to pass to the function
		# @return {Promise} A new promise with the original results
		
		call: (functionName, params...) =>
			@then (object) ->
				object[functionName] params...
		
		
		
		# Similar to <code>call()</code> but expects the object to be an array and the function called to return a
		# promise. This will call the function on each item and return only when all have finished.
		# 
		# @param {String} functionName The name of the function to call
		# @param {mixed} [...arguments] Zero or more arguments to pass to the function
		# @return {Promise} A new promise with the original results
		
		when: (functionName, params...) =>
			@then (array) ->
				promiseWhenAll array.map (object) -> object[functionName] params...
	
	
	# Add array methods onto promise for async array handling
	['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'filter', 'forEach', 'every', 'map', 'some'].forEach (method) ->
		Promise::[method] = (args...) ->
			@then (object) ->
				result = object[method](args...) if object instanceof Array
				result ? object
	
	
	
	# Combines one or more methods behind a promise. If the methods return a promise <code>when</code> will wait until they
	# are finished to complete its promise.
	# 
	# Example:
	# <code>when(method1(), method2()).then (result1, result2) -> # handle...</code>
	# both methods have finished and the results from their promises are available
	
	promiseWhen = (params...) ->
		deferred = new Deferred
		count = params.length
		failed = false
		fulfilledCallback = ->
		failedCallback = (value) ->
			failed = true
			value
		
		createCallback = (index) ->
			(results...) ->
				params[index] = if results.length > 1 then results else results[0]
				
				if --count is 0
					if failed
						deferred.fail params...
					else
						deferred.fulfill params...
		
		
		for obj, name in params
			if obj and typeof obj.then is 'function'
				finishedCallback = createCallback(name)
				obj.then fulfilledCallback, failedCallback 
				obj.then finishedCallback, finishedCallback
			else
				--count
		
		if count is 0
			deferred.fulfill params...
		
		deferred.promise
	
	
	promiseWhenAll = (promises) ->
		deferred = new Deferred
		
		promiseWhen.apply(null, promises).then (args...) ->
			deferred.fulfill(args)
		, (args...) ->
			deferred.fail(args)
		
		deferred.promise
	
	
	# Allows returning multiple values from a method that will be passed in as arguments in any methods handling the
	# promise.
	# @param ...arguments to be passed in
	
	args = (params...) ->
		params.isArgs = true
		params
	
	
	
	
	# Represents a deferred action with an associated promise.
	# 
	# @param promise Allow for custom promises to be used with deferred.
	
	class Deferred
		constructor: (promise = new Deferred.Promise) ->
			@promise = promise
			@status = 'unfulfilled'
			@progressHandlers = []
			@handlers = []
			
			# wrap the promises' cancel function so that it will fail the deferred after being called
			cancel = promise.cancel
			promise.cancel = (params...) =>
				@status = 'canceled'
				cancel.apply promise, params
				
			# overwrite the promise's then with the deferred's for deferred to handle
			promise.then = @then
		
		
		# handle a promise whether it was fulfilled, failed, and/or its progress
		then: (fulfilledHandler, failedHandler, progressHandler, canceledHandler) =>
			@progressHandlers.push(progressHandler) if progressHandler
			nextDeferred = new Deferred
			nextDeferred.promise.prev = @.promise
			
			handler = 
				fulfilled: fulfilledHandler
				failed: failedHandler
				nextDeferred: nextDeferred
				canceled: canceledHandler
			
			if @finished()
				notify.call this, handler
			else
				@handlers.push handler
			
			nextDeferred.promise
		
		
		# whether or not the deferred is finished processing
		finished: -> @status != 'unfulfilled'
		
		
		# successfully fulfill this deferred's promise.
		fulfill: (params...) =>
			if params[0]?.isArgs then params = params[0]
			finish.call this, 'fulfilled', params
		
		
		# fail this deferred's promise
		fail: (params...) => finish.call this, 'failed', params
		
		
		# cancel this deferred's promise
		cancel: (params...) => finish.call this, 'canceled', params
		
		
		# update progress on this deferred's promise
		progress: (params) => progress params... for progress in @progressHandlers
		
		
		# set a timeout for this deferred to auto-fail
		timeout: (milliseconds, error) ->
			clearTimeout @_timeout
			
			@_timeout = setTimeout =>
				@fail error ? new Error 'Operation timed out'
			, milliseconds
		
		
		# reset this deferred dropping all handlers and resetting status
		reset: ->
			@status = 'unfulfilled'
			@progressHandlers = []
			@handlers = []
		
	
	
	# private method to finish the promise
	finish = (status, results) ->
		return if @status isnt 'unfulfilled'  # throw new Error('Deferred has already been ' + this.status);
		clearTimeout @_timeout
		@status = status
		@results = results
		notify.call this, handler for handler in @handlers
	
	
	# private method to notify the hanlder
	notify = (handler) ->
		results = @results
		method = handler[@status]
		deferred = handler.nextDeferred
		
		# pass along the error/result
		if not method
			deferred[@status.slice(0, -2)] results...
			return
		
		
		# run the then
		nextResult = method results...
		
		if nextResult and typeof nextResult.then is 'function'
			nextResult.then deferred.fulfill, deferred.fail
		else if nextResult instanceof Error
			deferred.fail nextResult
		else if nextResult is undefined
			# pass along the error/result
			deferred[this.status.slice(0, -2)] results...
		else
			deferred.fulfill nextResult
		
		undefined
	
	
	Deferred.Promise = Promise # default promise implementation
	
	
	if not Function::bind
		Function::bind = (obj, params...) ->
			self = this
			nop = ->
			bound = (localParams...) ->
				self.apply( (this instanceof nop ? this : (obj ? {}) ), params.concat localParams)
			nop.prototype = self.prototype
			bound.prototype = new nop()
			bound
	
	
	Deferred: Deferred
	Promise: Promise
	args: args
	when: promiseWhen
	whenAll: promiseWhenAll
	
	# call a method that takes a callback returning the promise
	wrap: (method, promise) ->
		(args...) ->
			deferred = new Deferred promise
			if typeof args[args.length - 1] is 'function'
				callback = args.pop()
			
			args.push (err, results...) ->
				callback(err, results...) if callback
				if err then	deferred.fail err else deferred.fulfill results...
			
			method.apply @, args
			deferred.promise
	
	# shortcuts to create synchronous failed and fulfilled promises.
	fulfilled: (result, promise) ->
		deferred = new Deferred promise
		deferred.fulfill result
		deferred.promise
	
	failed: (err, promise) ->
		deferred = new Deferred promise
		deferred.fail err
		deferred.promise
	
