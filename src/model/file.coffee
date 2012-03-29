
define ['./model', './collection'], (Model, Collection) ->
	
	fileName = /[^\/]+\/?$/
	
	childSort = (a, b) ->
		a = a.id.toLowerCase()
		a = '/' + a if a.slice(-1) is '/'
		b = b.id.toLowerCase()
		b = '/' + b if b.slice(-1) is '/'
		if a < b
			-1
		else
			1
	
	
	
	class File extends Model
		
		idAttribute: 'key'
		
		@attr 'lastModified'
		@prop 'name'
		
		constructor: (attr, opts) ->
			attr?.lastModified = new Date(attr.lastModified)
			super(attr, opts)
			
			# update name when key is set/updated
			@on 'change:key', =>
				return unless @key
				@name = @key.match(fileName)[0]
				@isFolder = (@id.slice(-1) is '/')
			
			@trigger 'change:key' if attr.key
			
			# create children collection
			@children = new FileCollection()
			@children.on 'remove', (file) => file.parent = null
			@children.on 'add', (file) =>
				file.parent.remove(file) if file.parent
				file.parent = this
			
			
	
	
	
	class FileCollection extends Collection
		model: File
		comparator: childSort
	
	
	
	File.Collection = FileCollection
	
	File