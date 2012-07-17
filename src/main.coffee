
require ['app', 'view', 'util/admin-redirect'], (app) ->
	
	unless app.username
		location.pathname += 'login.html'
		return
	
	app.load().finished (sites) ->
		atSite = sites.get app.siteName
		if atSite then sites.selected = atSite else sites.selectedIndex = 0
