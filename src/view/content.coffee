
require ['app'], (app) ->
		
	
	
	app.children.on 'change:selected', (site, file) ->
		return unless file
		file.fetch()
		$('#code-editor').hide()
		$('#frame').prop('src', file.url) if file
	
	