
require ['app', 'view'], (app) ->
	
	# ensure we are at the correct domain and under https
	if location.protocol isnt 'https:' or location.host isnt 's3.amazonaws.com'
		path = 'websights' + location.pathname.replace(/^\/websights/, '')
		
		if location.host isnt 's3.amazonaws.com'
			path += '#' + location.host
		
		location.href = "https://s3.amazonaws.com/#{path}"
		throw new Error('Cannot administer site from this location.')
	
	
	unless app.username
		location.pathname = '/websights/admin/login.html'
		return
	
	app.load().finished (sites) ->
		sites.selectedIndex = 0
