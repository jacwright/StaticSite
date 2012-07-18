
define ['app', 'templates/site-menu-item', 'templates/breadcrumb', 'view/sidebar', 'view/content'], (app, siteMenuItem, breadcrumb) ->
	
	
	getBreadcrumbs = (selected) ->
		crumbs = []
		while selected
			crumbs.unshift selected
			selected = selected.parent
		crumbs.unshift app.site
		crumbs
	
	
	updateCrumbs = (selectedFile) ->
		$('#breadcrumbs > ul > li.crumb').remove()
		$('#breadcrumbs > ul').append breadcrumb getBreadcrumbs(selectedFile)
	
	
	app.files.on 'change:selected', (files, file) ->
		updateCrumbs file
	
	
	getDefaultFile = (folder) ->
		# index first, then first file
		defaultFile = folder.children.query('name').is('index.html').end().pop()
		defaultFile = folder.children.query('isFolder').isnt(true).end().shift() unless defaultFile
		return defaultFile
	
	
	$(window).on 'hashchange', ->
		url = location.hash.replace('#/', '')
		file = app.files.query('url').is(url).end().pop()
		if not file
			oldSelection = app.files.selected
			app.files.selected = null
			app.site.files.trigger('change:selected', app.site.files) unless oldSelection
			app.currentFiles.selected = getDefaultFile(app.site)
		else if file.isFolder
			app.files.selected = file
			app.currentFiles.selected = getDefaultFile(file)
		else
			app.currentFiles.selected = file
	
	
	app.site.on 'fetched', -> $(window).trigger('hashchange')
	
	
	# view code
	$ ->
		$('#site-name').text(app.site.name).attr('href', '#/' + app.site.name)
		$('body').fadeIn()
		
		$('#signedin-user').text app.username
		
		