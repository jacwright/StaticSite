# images

require ['app'], (app) ->
	
	app.registerType 'image', 'picture', (file) ->
		file.metadata.contentType.indexOf('image/') is 0