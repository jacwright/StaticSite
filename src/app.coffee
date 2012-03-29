
define ['app/auth', 'model/site'], (auth, Site) ->
	
	
	username: auth.authorize()
	sites: new Site.Collection()
	
	load: -> @sites.fetch()
	
	
	
	