
require ['app'], (app) ->
	
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
	
	editor = CodeMirror($('#code-editor').get(0),
		indentUnit: 4
		indentWithTabs: true
		lineNumbers: true
		theme: 'intellij'
	)
	
	editor.getScrollerElement().style.height = '100%'
	
	doc = -> $('#frame').get(0).contentDocument
	$('#code-editor').data('editor', editor)
	
	$('#main a.edit').on 'shown', ->
		editor.refresh()
	
		
	app.currentFiles.on 'reset change:selected', ->
		file = app.currentFiles.selected
		
		if file
			ext = file.key.split('.').pop().toLowerCase()
			if images[ext]
				doc().open()
				doc().write """
				<html>
				<head>
				<style>body{text-align:center;margin:0;padding:20px;}img{max-width:100%;max-height:1000px;background-image:url(img/checker.png);-moz-box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);-webkit-box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);}</style>
				</head>
				<body>
				<img src="#{'/' + file.site.name + '/' + file.key}" alt="">
				</body>
				</html>
				"""
				doc().close()
			else
				editor.setOption('mode', modes[ext] or 'default');
				file.fetch().then ->
					editor.setValue(file.content)
					localized = localize(file.content, '/' + file.site.name)
					doc().open()
					doc().write(localized)
					doc().close()
		else
			editor.setValue('')
#		$('#code-editor').hide()
#		$('#frame').prop('src', file.url) if file
#		$('#code-editor')
	
	
	localize = (content, base) ->
		window.content = content
		content = content.replace(/(<[^>]*?href=")(\/[^\/])/g, '$1' + base + '$2')
		content = content.replace(/(<a[^>]*?)(href=")(\/[^\/])/g, '$1target="_parent" $2#$3')
		content = content.replace(/(<a[^>]*?)(href=")([^#])/g, '$1target="_blank" $2$3')
		content = content.replace(/(<[^>]*?src=")(\/[^\/])/g, '$1' + base + '$2')
		return content
	
	