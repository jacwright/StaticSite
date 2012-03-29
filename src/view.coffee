
define ['app', 'view/sidebar'], (app) ->
	
	app.sites.on 'add', (site, sites, options) ->
		$('#site-list').children().eq(options.index).before '<li><a href="#"><span class="icon sitemap"></span> ' + site.name + '</a></li>'
	
	app.sites.on 'change:selected', (sites, site) ->
		$('#selected-site').text(site.name)
		document.title = 'Admin | ' + site.name
	
			
			
	
	
	# view code
	$ ->
		$('body').fadeIn()
		
		
	