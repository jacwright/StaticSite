
define ['./model', './collection', 'lib/promises'], (Model, Collection, promises) ->
	
	fileName = /([^\/]+)(\/)?$/
	extention = /\.(\w+)$$/
	icons =
		js: 'script'
		html: 'html'
		css: 'css'
	
	getExtention = (key) ->
		match = key.match extention
		return match?[1] or ''
	
	escapeRegex = (text) ->
		text.replace /([\\\*\+\?\|\{\[\(\)\^\$\.\#])/g, '\\$1'
	
	childSort = (a, b) ->
		a = a.id.toLowerCase()
		a = '/' + a if a.slice(-1) is '/'
		b = b.id.toLowerCase()
		b = '/' + b if b.slice(-1) is '/'
		if a < b
			-1
		else
			1
	
	onKeyChange = (model, key) ->
		return unless key
		model.name = key.match(fileName)[1]
		model.url = model.site?.url + key
		ext = getExtention(key)
		if icons.hasOwnProperty(ext)
			model.icon = icons[ext]
		else
			# default to the icon on prototype by deleting the one on this object
			delete model.icon
	
	
	
	class FileType extends Model
		@registered: []
		@attr 'name'
		@attr 'icon'
		@attr 'matches'
		
		@register: (fileType) ->
			if @registered[fileType.name] and (index = @registered.indexOf(@registered[fileType.name]))
				@registered.splice(index, 1)
			@registered.push fileType
			@registered[fileType.name] = fileType
		
		@get: (type) ->
			@registered[type]
		
		@matches: (file) ->
			registered = @registered
			
			for i in [registered.length..1]
				fileType = registered[i - 1]
				return fileType if fileType.matches(file)
			console.log('no file type for', file)
		
		constructor: (attr, opts) ->
			super(attr, opts)
		
	
	
	# default file type will match any
	FileType.register new FileType(name: 'file', icon: 'page', matches: -> true)
	FileType.register new FileType(name: 'folder', icon: 'folder', matches: (attr) -> attr.key.slice(-1) is '/')
	
	
	class File extends Model
		
		@subclasses = []
		idAttribute: 'key'
		
		@attr 'key'
		@attr 'lastModified'
		@attr 'metadata'
		@prop 'name'
		@prop 'url'
		@prop 'content'
		@prop 'fileType'
		@def 'type',
			get: -> @fileType.name
			set: (value) -> @fileType = FileType.registered[value]
		@def 'icon',
			get: -> @fileType.icon
		
		constructor: (attr, opts) ->
			type = attr.type
			delete attr.type
			attr.lastModified = new Date(attr.lastModified) if attr?.lastModified?
			super(attr, opts)
			
			# update name when key is set/updated
			@on 'change:key', onKeyChange
			@trigger('change:key', @, @id) if attr?.key
			
			# create children collection
			@children = new FileCollection()
			@children.on 'remove', (file) => file.parent = null
			@children.on 'add', (file) =>
				file.parent.remove(file) if file.parent
				file.parent = this
			
			@type = type if type
		
		
		keyFromName: (name) -> @id.replace fileName, name + '$2'
		
		
		copy: (newKey) ->
			# recursively copy all children and this to the new name
			oldKey = new RegExp('^' + escapeRegex @id)
			operations = @children.map (file) ->
				file.copy file.id.replace oldKey, newKey
			
			operations.push @site.bucket.copy @id, newKey
			
			promises.whenAll(operations).then => this
		
		
		destroy: (options) ->
			operations = @children.map (file) -> file.destroy()
			operations.push @site.bucket.destroy @id
			@trigger 'destroy', this, this.collection, options
			
			promises.whenAll(operations).then => this
		
		
		rename: (newKey) ->
			getKeys = (file) ->
				keys = []
				file.children.forEach (file) ->
					keys = keys.concat getKeys(file)
				keys.push file.id
				keys
							
			keysToDelete = getKeys(this)
			
			# recursively copy all children and this to the new name, once done delete all old files
			@copy(newKey).then =>
				operations = keysToDelete.map (key) => @site.bucket.destroy key
				promises.whenAll(operations).then => this
			
			@set 'key', newKey
			
		
		save: (options) ->
			return if @content is undefined
			@site.bucket.put(@id, @content, metadata: @metadata)
			
		
		
		fetchMetadata: (options) ->
			if app.cache[@id]?.lastModified is @lastModified.getTime()
				promise = promises.fulfilled app.cache[@id]
			else
				promise = app.site.bucket.metadata(@id)
			
			promise.then (metadata) =>
				@metadata = metadata
				@fileType = FileType.matches(@) unless @fileType
				app.cache[@id] = metadata
				@
		
		
		fetch: (options) ->
			@site.bucket.get(@id).then (content) =>
				@content = content
				@
	
	
	
	class FileCollection extends Collection
		model: File
		comparator: childSort
	
	
	File.Collection = FileCollection
	File.Type = FileType
	
	
	
	return File