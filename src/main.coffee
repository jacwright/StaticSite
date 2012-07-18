
require ['app', 'view', 'util/admin-redirect'], (app) ->
	
	unless app.username
		location.pathname += 'login.html'
		return
	
	app.load()
