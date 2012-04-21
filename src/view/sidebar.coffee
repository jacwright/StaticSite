
require ['app', 'templates/menu-item', 'templates/new-file'], (app, menuItem, newFile) ->
	
	
	onFileAdd = (file, files, options) ->
		nextFile = $('#menu ul').children().eq(options.index)
		if nextFile.length then nextFile.before menuItem(file) else $('#menu ul').append menuItem(file)
	
	
	app.children.on 'add', onFileAdd
	
	
	app.children.on 'change:selectedIndex', (site, index) ->
		$('#menu ul li.active').removeClass('active')
		$('#menu ul li').eq(index).addClass('active')
	
	
	app.children.on 'change:selected', (site, file) ->
		$('#frame').prop('src', file.url)
	
	
	app.children.on 'reset', ->
		# move out to current selected folder
		$('#menu ul li').remove()
		app.children.forEach (file, index) ->
			onFileAdd(file, app.children, index: index)
	
	
	
	
	
	
	
	
	# view code
	$ ->
		$('#new-file').click ->
			newFile().modal(backdrop: 'static')
		
		
		$('#menu').delegate 'li', 'click', ->
			app.children.selected = app.children.get $(this).data('id')
		
		
		$('#menu').delegate 'li', 'dblclick', (event) ->
			file = $(this).data 'model'
			if file.isFolder
				app.files.selected = app.children.get $(this).data('id')
			