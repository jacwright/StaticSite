
require ['app', 'templates/menu-item', 'templates/new-file'], (app, menuItem, newFile) ->
	
	site = null
	
	onSelectedSiteChange = (sites, selectedSite) ->
		site?.files.off 'change:selected', onSelectedFileChange
		
		site = selectedSite
		site.files.on 'change:selected', onSelectedFileChange
		onSelectedFileChange site, site.files.selected
		
		
		# move out to current selected folder
		$('#menu ul li').remove();
		site.children.on 'add', onFileAdd
		site.children.forEach (file, index) ->
			onFileAdd(file, site.children, index: index)
	
	
	onSelectedFileChange = (site, selectedFile) ->
		
	
	onFileAdd = (file, files, options) ->
		nextFile = $('#menu ul').children().eq(options.index)
		if nextFile.length then nextFile.before menuItem(file) else $('#menu ul').append menuItem(file)
	
	
	app.sites.on 'change:selected', onSelectedSiteChange
	
	onSelectedSiteChange(app.sites, app.sites.selected) if app.sites.selected
	
	
	# view code
	$ ->
		$('#new-file').click ->
			newFile().modal(backdrop: 'static')
		
		
		$('#menu').delegate 'li', 'click', ->
			$(this).siblings('.active').removeClass('active')
			$(this).toggleClass('active')