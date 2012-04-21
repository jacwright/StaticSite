
define ['app/auth', 'model/site', 'model/file'], (auth, Site, File) ->
	
	app = 
		username: auth.authorize()
		sites: new Site.Collection()
		files: new File.Collection()
		children: new File.Collection()
		
		load: -> @sites.fetch()
	
	
	proxy = (event, args...) ->
		if args[args.length - 1] isnt 'cloned'
			args.push 'cloned'
			@trigger event, args...
	
	
	cloneCollection = (from, to) ->
		to.clonedFrom = from
		
		# make the models arrays the same so they stay in sync
		to.models = from.models
		to.length = from.length
		to._byId = from._byId
		to._byCid = from._byCid
		
		# proxy events across to each other
		to.on 'all', proxy, from
		from.on 'all', proxy, to
		
		# update listeners that the collection is new
		to.trigger 'reset', to, {}
	
	
	uncloneCollection = (to) ->
		from = to.clonedFrom
		to.off 'all', proxy, from
		from.off 'all', proxy, to
	
	
	app.files.on 'change:selected', (files, parent, options) ->
		parent ?= app.sites.selected
		uncloneCollection app.children
		cloneCollection parent.children, app.children
	
	
	app.sites.on 'change:selected', (sites, site, options) ->
		# remove old listeners
		if options.oldValue
			uncloneCollection app.files
			uncloneCollection app.children
		
		if site
			cloneCollection site.files, app.files
			cloneCollection site.children, app.children
			unless site.children.selected
				site.children.selected = site.children.get 'index.html'
			
	
	window.app = app
	app