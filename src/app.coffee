
define ['app/auth', 'model/site', 'model/file'], (auth, Site, File) ->
	
	app =
		siteName: location.pathname.split('/')[1]
		username: auth.authorize()
		sites: new Site.Collection()
		files: new File.Collection()
		currentFiles: new File.Collection()
		
		load: -> @sites.fetch()
		
		register: (page) ->
			
	
	
	app.siteName = null if app.siteName is 'websights'
	
	app.sites.on 'change:selected', (sites, site, options) ->
		# remove old listeners
		if options.oldValue
			app.files.unbecome()
			app.currentFiles.unbecome()
		
		if site
			app.files.become site.files
	
	
	app.files.on 'reset change:selected', (files) ->
		parent = files.selected or app.sites.selected
		app.currentFiles.unbecome()
		app.currentFiles.become parent.children
		
		if app.currentFiles.selected is null
			# index first, then first file
			defaultPage = app.currentFiles.query('name').is('index.html').end().pop()
			defaultPage = app.currentFiles.query('isFolder').isnt(true).end().shift() unless defaultPage
			app.currentFiles.selected = defaultPage
			
	
	window.app = app
	app