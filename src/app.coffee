
define ['app/auth', 'model/site', 'model/file'], (auth, Site, File) ->
	
	app = 
		username: auth.authorize()
		sites: new Site.Collection()
		files: new File.Collection()
		children: new File.Collection()
		
		load: -> @sites.fetch()
	
	
	
	app.sites.on 'change:selected', (sites, site, options) ->
		# remove old listeners
		if options.oldValue
			app.files.unbecome()
			app.children.unbecome()
		
		if site
			app.files.become site.files
	
	
	app.files.on 'reset change:selected', (files) ->
		parent = files.selected or app.sites.selected
		app.children.unbecome()
		app.children.become parent.children
		indexPage = app.children.query('name').is('index.html').end().pop()
		
		if app.children.selected is null and indexPage
			app.children.selected = indexPage
			
	
	window.app = app
	app