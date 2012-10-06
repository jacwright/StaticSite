
require ['app', 'view/displays'], (app, displays) ->
	
	modes =
		txt: 'default'
		html: 'htmlmixed'
		js: 'javascript'
		css: 'css'
	
	images =
		gif: true
		jpg: true
		jpeg: true
		png: true
		tiff: true
		
	app.currentFiles.on 'reset change:selected', ->
		file = app.currentFiles.selected
		if file
			ext = file.key.split('.').pop().toLowerCase()
			if file.type is 'image'
				displays.setDisplays [
					type: 'iframe'
					label: 'Image'
					content: """
						<html>
						<head>
						<style>body{text-align:center;margin:0;padding:20px;}img{max-width:100%;max-height:1000px;background-image:url(img/checker.png);-moz-box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);-webkit-box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);}</style>
						</head>
						<body>
						<img src="#{'/' + file.site.name + '/' + file.key}" alt="">
						</body>
						</html>
						"""
					]
			else if file.name is 'index.html' and file.parent.type is 'admin-folder'
				displays.setDisplays [
					type: 'iframe'
					label: 'Admin'
					content: ''
				]
			else if ext is 'html'
				file.fetch().then ->
					displays.setDisplays [
						{
							type: 'iframe'
							label: 'View'
							content: localize(file.content, '/' + file.site.name)
						}, {
							type: 'code'
							label: 'Edit'
							mode: modes.html
							content: file.content
						}
					]	
			else
				file.fetch().then ->
					displays.setDisplays [
						type: 'code'
						label: 'Edit'
						mode: modes[ext]
						content: file.content
					]	
		else
			displays.setDisplays []
	
	
	localize = (content, base) ->
		window.content = content
		content = content.replace(/(<[^>]*?href=")(\/[^\/])/g, '$1' + base + '$2')
		content = content.replace(/(<a[^>]*?)(href=")(\/[^\/])/g, '$1target="_parent" $2#$3')
		content = content.replace(/(<a[^>]*?)(href=")([^#])/g, '$1target="_blank" $2$3')
		content = content.replace(/(<[^>]*?src=")(\/[^\/])/g, '$1' + base + '$2')
		return content
	
	