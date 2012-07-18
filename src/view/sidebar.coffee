
require ['app', 'model/file', 'model/folder', 'templates/menu-item', 'templates/new-file'], (app, File, Folder, menuItem, newFile) ->
	
	
	onFileAdd = (file, files, options) ->
		nextFile = $('#menu > ul').children().eq(options.index)
		if nextFile.length
			menuItem(file).insertBefore nextFile
		else
			menuItem(file).appendTo '#menu > ul'
	
	
	app.currentFiles.on 'add', onFileAdd
	
	app.currentFiles.on 'remove', (file, files, options) ->
		$("#menu li[data-id=#{file.cid}]").remove()
	
	
	app.currentFiles.on 'reset', ->
		# move out to current selected folder
		$('#menu ul li').remove()
		app.currentFiles.forEach (file, index) ->
			onFileAdd(file, app.currentFiles, index: index)
	
	
	app.currentFiles.on 'reset change:selected', ->
		$('#menu li.active').removeClass('active')
		$("#menu li[data-id=#{app.currentFiles.selected.cid}]").addClass('active') if app.currentFiles.selected
	
	
	editName = (file, isNew = false) ->
		item = $("#menu li[data-id=#{file.cid}]")
		input = $('<input name="name" type="text">').val(file.name).appendTo item.find('h5')
		input.focus()
		
		done = -> input.remove()
		cancel = ->
			if isNew
				app.currentFiles.remove file
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
		
		# select a file or open a folder when clicked
		$('#menu').delegate 'li', 'click', (event) ->
			return if $(event.target).closest('.actions').length
			file = $(this).data 'model'
			location.hash = '#/' + file.url
		
		
		## FILE ACTIONS
		
		# all action links should have the default prevented
		$('#menu').delegate '.actions a', 'click', (event) ->
			event.preventDefault()
		
		# close delete confirmation if left open
		$('#menu').delegate '.dropdown-toggle', 'click', (event) ->
			$(this).closest('li').find('.delete.confirm').removeClass('confirm')
		
		# add the confirm class to show the Yes/Cancel confirmation for deleting
		$('#menu').delegate '.delete .action', 'click', (event) ->
			event.stopPropagation()
			$(this).closest('.delete').addClass('confirm')
		
		# cancel a delete by removing the confirm class
		$('#menu').delegate '.delete .cancel', 'click', (event) ->
			event.stopPropagation()
			$(this).closest('.delete').removeClass('confirm')
		
		# delete the file
		$('#menu').delegate '.delete .confirm', 'click', ->
			file = $(this).closest('li.menu-item').data('model')
			file.destroy()
		
		# rename the file
		$('#menu').delegate '.actions .rename', 'click', ->
			file = $(this).closest('li.menu-item').data('model')
			editName file
		
		
		# new folder action
		$('#new-folder').click (event) ->
			event.preventDefault()
			name = 'new-folder/'
			name = app.files.selected.key + name if app.files.selected
			
			while app.currentFiles.get name
				name = name.replace /(-(\d+))?\/$/, (match, appended, num) ->
					return '-' + (parseInt(num) + 1 or 2) + '/'
			
			file = new Folder key: name, lastModified: new Date()
			app.files.add file
			app.currentFiles.add file
			editName file, true
		
			
			