
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
		return defaultFile
	
	
	$(window).on 'hashchange', ->
		url = location.hash.replace('#/', '')
		file = app.files.query('url').is(url).end().pop()
		
		# if the file doesn't exist, choose the error page
		if not file and url.replace(/[^\/]+\//, '')
			file = app.files.query('url').is(url.split('/').shift() + '/error.html').end().pop()
		
		if not file
			oldSelection = app.files.selected
			app.files.selected = null
			app.site.files.trigger('change:selected', app.site.files) unless oldSelection
			app.currentFiles.selected = getDefaultFile(app.site)
		else if file.type.split('-').pop() is 'folder'
			app.files.selected = file
			app.currentFiles.selected = getDefaultFile(file)
		else
			oldSelection = app.files.selected
			app.files.selected = file.parent
			app.site.files.trigger('change:selected', app.site.files) unless oldSelection and file.parent
			app.currentFiles.selected = file
	
	
	app.site.on 'fetched', -> $(window).trigger('hashchange')
	
	
	# view code
	$ ->
		$('#site-name').text(app.siteName).attr('href', '#/' + app.siteName)
		$('#logout').attr('href', $('#logout').attr('href') + '#/' + app.siteName)
		$('body').fadeIn()
		
		$('#signedin-user').text app.username
		
		