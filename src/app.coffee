
define ['app/auth', 'model/site', 'model/file'], (auth, Site, File) ->
	bucket = location.hash.replace(/^#\/([^\/]+).*/, '$1')
	site = new Site(name: bucket)
	
	return unless bucket
	
	app =
		siteName: location.pathname.split('/')[1]
		username: auth.authorize()
		site: site
		files: site.files
		currentFiles: new File.Collection()
		
		load: ->
			@site.fetch().finished ->
				site.files.trigger('change:selected', site.files) unless app.files.selected
		
		registerType: (page) ->
			
	
	
	
	app.files.on 'change:selected', (files) ->
		parent = files.selected or app.site
		app.currentFiles.unbecome()
		app.currentFiles.become parent.children
	
	
	window.app = app
	app