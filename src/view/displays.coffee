
define ->
	
	setDisplays: (displays) ->
		$('#tabs li').remove()
		$('#displays > *').remove()
		for display, i in displays
			tab = $('<li><a href="#display' + i + '" data-toggle="tab"></a></li>').appendTo('#tabs').find('a').text(display.label).end()
			tabContent = $('<div id="display' + i + '" class="tab-pane"></div>').appendTo('#displays')
			if (display.type is 'code')
				editor = CodeMirror(tabContent.get(0),
					indentUnit: 4
					indentWithTabs: true
					lineNumbers: true
					theme: 'default'
				)
				editor.getScrollerElement().style.height = '100%'
				tabContent.data('editor', editor)
				editor.setOption('mode', display.mode or 'default')
				editor.setValue(display.content or '')
				tab.find('a').on 'shown', ->
					editor.refresh()
			else if display.type is 'iframe'
				frame = $('<iframe></iframe>').appendTo(tabContent)
				doc = frame.get(0).contentDocument
				doc.open()
				doc.write(display.content or '')
				doc.close()
			else
				tabContent.append(display.content) if display.content
		
		$('#tabs li:first, #displays > *:first').addClass('active')
	