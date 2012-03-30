
define ['./model', './collection'], (Model, Collection) ->
	
	fileName = /([^\/]+)\/?$/
	extention = /\.(\w+)$$/
	icons =
		js: 'script'
		html: 'html'
		css: 'css'
	
	getExtention = (key) ->
		match = key.match extention
		return match?[1] or ''
	
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
		ext = getExtention(key)
		if icons.hasOwnProperty(ext)
			model.icon = icons[ext]
		else
			# default to the icon on prototype by deleting the one on this object
			delete model.icon
	
	
	
	class File extends Model
		
		@subclasses = []
		idAttribute: 'key'
		icon: 'page'
		
		@attr 'lastModified'
		@prop 'name'
		
		constructor: (attr, opts) ->
			attr?.lastModified = new Date(attr.lastModified)
			super(attr, opts)
			
			# update name when key is set/updated
			@on 'change:key', onKeyChange
			@trigger('change:key', @, @id) if attr.key
			
			# create children collection
			@children = new FileCollection()
			@children.on 'remove', (file) => file.parent = null
			@children.on 'add', (file) =>
				file.parent.remove(file) if file.parent
				file.parent = this
	
	
	
	class FileCollection extends Collection
		model: File
		comparator: childSort
		
		_prepareModel: (model, options = {}) ->
			unless model instanceof Model
				modelClass = @model
				attrs = model
				options.collection = this
				
				File.subclasses.some (subclass) ->
					if subclass.match(attrs)
						modelClass = subclass
						true
					else
						false
				
				model = new modelClass(attrs, options)
			super(model, options)
	
	
	File.Collection = FileCollection
	
	
	return File