EventEmitter = require('events').EventEmitter
promises = require('../libs/promises')
_ = require('underscore')
s3 = require('../libs/s3').s3


bucketName = location.pathname.replace(/^\/([^\/]+).*/, '$1')
path = '/' + bucketName + '/admin/'
bucket = null


data = module.exports = _.extend new EventEmitter,
	
	collections: {}
	
	get: (url) -> bucket.get('api/' + url)
	
	put: (url, data) -> bucket.put('api/' + url, data)
	
	destory: (url) -> bucket.destory('api/' + url)
	
	refresh: (options) ->
		deferred = new promises.Deferred()
		promise = deferred.promise
		
		bucket.list('api/').then (results) ->
			urlExp = /^api\/(\w+)\/(\w+)$/
			has = {}
			
			
			results.contents.forEach (item) ->
				match = item.key.match(urlExp)
				return unless match
				[full, type, id] = match
				return unless data.collections.hasOwnProperty(type)
				
				collection = data.collections[type]
				has[type] = {} unless has[type] 
				
				has[type][id] = true
				
				# if we have it and it is up-to-date, don't load it.
				return if collection.get(id) and collection.get(id).etag is item.etag
				
				# queue up all the calls so that the final promise won't be done until all of these are.
				promise = promise.then bucket.get(item.key).then (data) ->
					data = JSON.parse(data)
					data.id = id # just in case it hadn't been set
					if collection.get(id)
						collection.get(id).set(data, options).etag = item.etag
					else
						collection.add(data, options).get(id).etag = item.etag
					
				, (error) ->
					console.error(error)
				
			
			# remove deleted items
			for type, ids of has
				remove = []
				collection = data.collections[type]
				collection.each (item) ->
					remove.push(item) unless ids[item.id]
				
				collection.remove(remove, options)
			
		, deferred.fail
		
		# return the data object as the promise result from this call
		promise.then -> data
	
	
	auth: ->
		creds = sessionStorage.getItem('creds') or localStorage.getItem('creds')
		if creds
			creds = creds.split(':')
			@username = creds.shift()
			s3.auth(creds.shift(), creds.shift())
			bucket = s3.bucket(bucketName)
			true
		else
			false

