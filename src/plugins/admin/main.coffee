# admin

require ['app'], (app) ->
	
	app.registerType 'admin-folder', 'folder-wrench', (file) ->
		file.key is 'admin/'
		
	app.registerType 'settings', 'page-white-wrench', (file) ->
		file.key.split('.').pop() is 'json'
	
	app.registerType 'template-folder', 'folder', (file) ->
		file.key is 'admin/templates/'