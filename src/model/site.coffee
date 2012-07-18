
define ['./model', './collection', './file', 'lib/s3', './folder', './page', './admin-files'], (Model, Collection, File, s3) ->
	
	trailingSlash = /\/$/
	fileName = /[^\/]+\/?$/
	
	
	
	class Site extends Model
		
		idAttribute: 'name'
		@attr 'name'
		@attr 'creationDate'
		@prop 'url'
		icon: 'sitemap'
		
		
		constructor: (attr, opts) ->
			attr?.creationDate = new Date(attr.creationDate)
			super(attr, opts)
			
			@url = "#{@name}/"
			@bucket = s3.bucket(@name)
			@_lookup = {}
			@files = new File.Collection([], comparator: (file) -> file.id.toLowerCase())
			@children = new File.Collection()
			
			@files.on 'add', (file, files) =>
				# add url info
				file.site = this
				file.url = @url + file.id
				
				# assign to parent's children collection
				parentId = file.id.replace(fileName, '')
				@_lookup[file.id] = file
				
				parent = @_lookup[parentId] or @_lookup[parentId.replace(trailingSlash, '')]
				if parent
					parent.children.add(file)
				else
					@children.add(file)
		
		
		fetch: (options) ->
			@bucket.list().make(File).when('fetchMetadata').then (files) =>
				@files.add files
				@trigger('fetched', @)
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