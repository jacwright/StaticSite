
define ['app', 'templates/site-menu-item', 'templates/breadcrumb', 'view/sidebar', 'view/content'], (app, siteMenuItem, breadcrumb) ->
	
	
	getBreadcrumbs = (selected) ->
		crumbs = []
		while selected
			crumbs.unshift selected
			selected = selected.parent
		crumbs.unshift app.sites.selected
		crumbs
	
	
	updateCrumbs = (selectedFile) ->
		$('#breadcrumbs > ul > li.crumb').remove()
		$('#breadcrumbs > ul').append breadcrumb getBreadcrumbs(selectedFile)
	
	
	app.sites.on 'add', (site, sites, options) ->
		$('#site-list').children().eq(options.index).before siteMenuItem(site)
	
	
	app.sites.on 'change:selected', (sites, site) ->
		document.title = 'Admin | ' + site.name
		updateCrumbs()
	
	
	app.files.on 'change:selected', (files, file) ->
		updateCrumbs file
	
	
	
	# view code
	$ ->
		$('body').fadeIn()
		
		$('#signedin-user').text app.username
		
		$('#breadcrumbs').delegate 'li.crumb a', 'click', (event) ->
			event.preventDefault()
			fileId = $(this).attr('href').replace app.sites.selected.url, ''
			app.files.selected = app.files.get fileId
		
		$('#site-list').delegate 'li', 'click', (event) ->
			event.preventDefault()
			site = $(this).data('model')
			if site
				app.sites.selected = site
		
		siteName = location.pathname.split('/')[1]
		if siteName isnt 'websights'
			$('#site-name').text(siteName).attr('href', 'http://' + siteName + '/')