
# ensure we are at the correct domain
if location.protocol isnt 'https:' or location.host isnt 's3.amazonaws.com'
	location.href = "https://s3.amazonaws.com/#{location.host}#{location.pathname}"
	throw new Error('Cannot administer site from this location.')



data = require('./app/data')
pages = require('./app/page').collection



setup = ->
	
	# create main app collections
	loadPages()
	
	# load the data
#	return data.refresh({ silent: true })
#			.get('collections')#.get('plugins').then(initPlugins)


openPage = (name, page) ->
	if (page.find('.sidebar').length) $('body').addClass('with-sidebar')
	else $('body').removeClass('with-sidebar')
	$('body').removeClass('loading')




loadPages = (key) ->
	cache = localStorage.getItem('pages') or undefined if typeof localStorage isnt 'undefined'
	cache = JSON.parse(cache)
	pages.refresh(cache, {silent: true})

	
	
	
if data.auth() then setup() else location.href = 'login.html'