
define ['app/auth', 'model/site', 'model/file'], (auth, Site, File) ->
	site = new Site(name: auth.siteName)
	
	app =
		siteName: auth.siteName
		username: auth.authorize()
		site: site
		files: site.files
		currentFiles: new File.Collection()
		cache: JSON.parse localStorage.getItem('appcache') or '{}'
		
		load: ->
			require ['plugins/admin/main', 'plugins/codeable/main', 'plugins/images/main'], =>
				@site.fetch().finished ->
					site.files.trigger('change:selected', site.files) unless app.files.selected
					localStorage.setItem('appcache', JSON.stringify(app.cache))
		
		registerType: (name, icon, matches) ->
			File.Type.register new File.Type(name: name, icon: icon, matches: matches)
	
	
	
	app.files.on 'change:selected', (files) ->
		parent = files.selected or app.site
		app.currentFiles.unbecome()
		app.currentFiles.become parent.children
	
	
	window.app = app
	app