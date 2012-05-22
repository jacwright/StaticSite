
require ['app'], (app) ->
	
	modes =
		html: new (ace.require('ace/mode/html').Mode)
		js: new (ace.require('ace/mode/html').Mode)
		css: new (ace.require('ace/mode/html').Mode)
	
	editor = ace.edit($('#code-editor').get(0))
	
	$('#code-editor').data('editor', editor)
	session = editor.getSession()
	session.setMode(modes.html)
	session.setUseSoftTabs(false)
	editor.renderer.setShowPrintMargin(false)
	editor.renderer.setShowGutter(true)
	editor.renderer.setHScrollBarAlwaysVisible(false)
	
	
	
	
	app.currentFiles.on 'reset change:selected', ->
		file = app.currentFiles.selected
		return unless file
		file.fetch().then ->
			session.setValue(file.content)
#		$('#code-editor').hide()
#		$('#frame').prop('src', file.url) if file
#		$('#code-editor')
	