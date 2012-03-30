
define ['./model', './collection', './file', 'lib/s3', './folder', './page'], (Model, Collection, File, s3) ->
	
	trailingSlash = /\/$/
	fileName = /[^\/]+\/?$/
	
	createFileHierarchy = (files, children) ->
		lookup = {}
		files.forEach (file) ->
			parentId = file.id.replace(fileName, '')
			lookup[file.id] = file
			
			parent = lookup[parentId] or lookup[parentId.replace(trailingSlash, '')]
			if parent
				parent.children.add(file)
			else unless file.id is 'admin/'
				children.add(file)
	
	
	
	
	class Site extends Model
		
		@attr 'name'
		@attr 'creationDate'
		
		
		constructor: (attr, opts) ->
			attr?.creationDate = new Date(attr.creationDate)
			super(attr, opts)
			
			@bucket = s3.bucket(@name)
			@files = new File.Collection(@get('files'), comparator: (file) -> file.id.toLowerCase())
			@children = new File.Collection()
		
		
		fetch: (options) ->
			@bucket.list().then (files) =>
				@files.add files
				createFileHierarchy(@files, @children)
				@
		
	
	
	class SiteCollection extends Collection
		model: Site
		comparator: (a, b) -> a.creationDate.getTime() < b.creationDate.getTime()
		
		fetch: (options) ->
			s3.list().get('buckets').make(Site).when('fetch').finished (sites) =>
				sites = sites.filter (site) -> site instanceof Site # filter out errors for unauthorized buckets
				@add sites
				@
	
	
	Site.Collection = SiteCollection
	
	Site