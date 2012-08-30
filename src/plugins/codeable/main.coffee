# codeable

require ['app'], (app) ->
	
	app.registerType 'html', 'html', (file) ->
		file.metadata.contentType is 'text/html' and file.key isnt 'admin/'
		
	app.registerType 'css', 'css', (file) ->
		file.metadata.contentType is 'text/css'
	
	app.registerType 'javascript', 'script', (file) ->
		file.metadata.contentType is 'application/javascript'
	
		
	