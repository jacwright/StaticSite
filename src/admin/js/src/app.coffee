data = require('./app/data')

# ensure we are at the correct domain
if location.protocol isnt 'https:' or location.host isnt 's3.amazonaws.com'
	location.href = "https://s3.amazonaws.com/#{location.host}#{location.pathname}"
	throw new Error('Cannot administer site from this location.')



setup = ->
	return
	# create main app collections
	col = data.collections
	col.pages = createCollection('pages')
	col.templates = createCollection('templates')
	col.content = createCollection('content')
#	col.plugins = createCollection('plugins')
	
	# load the data
	return data.refresh({ silent: true })
			.get('collections')#.get('plugins').then(initPlugins)


openPage = (name, page) ->
	if (page.find('.sidebar').length) $('body').addClass('with-sidebar')
	else $('body').removeClass('with-sidebar')
	$('body').removeClass('loading')


# allow plugins?
#initPlugins = (plugins) ->
#	plugins.forEach (plugin) ->
#		require(plugin.moduleId) if (plugin.active)
#	return data



createCollection = (key) ->
	data = localStorage.getItem(key) || undefined if typeof localStorage isnt 'undefined'
	try
		collection = require(key)[key]
		collection.refresh(data, {silent: true})
	catch e
		collection = new Collection(data, { url: 'api/' + key })
	
	return collection

	
	
	
	
if data.auth() then setup() else location.href = 'login.html'