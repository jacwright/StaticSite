
require ['app', 'model/file', 'model/folder', 'templates/menu-item', 'templates/new-file'], (app, File, Folder, menuItem, newFile) ->
	
	
	onFileAdd = (file, files, options) ->
		nextFile = $('#menu > ul').children().eq(options.index)
		if nextFile.length
			menuItem(file).insertBefore nextFile
		else
			menuItem(file).appendTo '#menu > ul'
	
	
	app.children.on 'add', onFileAdd
	
	app.children.on 'remove', (file, files, options) ->
		$("#menu li[data-id=#{file.cid}]").remove()
	
	
	app.children.on 'reset', ->
		# move out to current selected folder
		$('#menu ul li').remove()
		app.children.forEach (file, index) ->
			onFileAdd(file, app.children, index: index)
	
	
	app.children.on 'reset change:selected', ->
		$('#menu li.active').removeClass('active')
		$("#menu li[data-id=#{app.children.selected.cid}]").addClass('active') if app.children.selected
	
	
	editName = (file, isNew = false) ->
		item = $("#menu li[data-id=#{file.cid}]")
		input = $('<input name="name" type="text">').val(file.name).appendTo item.find('h5')
		input.focus()
		
		done = -> input.remove()
		cancel = ->
			if isNew
				app.children.remove file
				app.files.remove file
			else
				done()
		save = ->
			key = file.keyFromName input.val()
			if isNew
				file.key = key
				file.save()
			else if file.name isnt input.val()
				file.rename key
			done()
		input.blur ->
			if isNew then save()
			else cancel()
		input.keydown (event) ->
			switch event.keyCode
				when 13 then save()
				when 27 then cancel()
	
	
	
	# view code
	$ ->
		$('#new-file').click ->
			newFile().modal(backdrop: 'static')
		
		
		$('#menu').delegate 'li', 'click', (event) ->
			return if $(event.target).closest('.actions').length
			app.children.selected = app.children.get $(this).data('model').id
		
		$('#menu').delegate 'li', 'dblclick', ->
			file = $(this).data 'model'
			if file.isFolder
				app.files.selected = app.children.get $(this).data('model').id
		
		
		$('#menu').delegate '.actions a', 'click', (event) ->
			event.preventDefault()
		
		$('#menu').delegate '.delete .action', 'click', (event) ->
			event.stopPropagation()
			$(this).closest('.delete').addClass('confirm')
		
		$('#menu').delegate '.delete .cancel', 'click', (event) ->
			event.stopPropagation()
			$(this).closest('.delete').removeClass('confirm')
		
		$('#menu').delegate '.delete .confirm', 'click', ->
			file = $(this).closest('li.menu-item').data('model')
			file.destroy()
		
		$('#menu').delegate '.actions .rename', 'click', ->
			file = $(this).closest('li.menu-item').data('model')
			editName file
		
		
		
		$('#new-folder').click (event) ->
			event.preventDefault()
			name = 'new-folder/'
			name = app.files.selected.key + name if app.files.selected
			
			while app.children.get name
				name = name.replace /(-(\d+))?\/$/, (match, appended, num) ->
					return '-' + (parseInt(num) + 1 or 2) + '/'
			
			file = new Folder key: name, lastModified: new Date()
			app.files.add file
			app.children.add file
			editName file, true
		
			
			