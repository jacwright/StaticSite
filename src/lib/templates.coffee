
define ['lib/backbone'], (backbone) ->
	
	module = {}
	
	module.get = get = (templateFunction, data = {}, opts = {}) ->
		if data instanceof Array or (Backbone && data instanceof Backbone.Collection)
			# detach so that the individual DocumentFragment parentNodes don't mess up insertions
			if opts.textOnly
				elem = data.map (data, index) ->
					opts.index = index
					get(file, data, opts)
				return elem.join('')
			else
				elem = []
				data.forEach (data, index) ->
					opts.index = index
					elem.push get(file, data, opts).detach().get().pop()
				return $ elem
		else
			html = templateFunction(data, opts.index)
			return html if opts.textOnly
			
			elem = $(html).data('model', data)
			elem.find('[data-template][data-data]').each ->
				sub = $ @
				propertyName = sub.attr('data-data').replace /^[^.]+\./, ''
				if data[propertyName]
					get(sub.attr 'data-template', data[propertyName]).appendTo(sub)
			
			if Backbone and data instanceof Backbone.Model and not opts.unbound
				data.bind 'change', ->
					elem = elem.replaceSilently(templateFunction(data, opts.index))
			elem
	
	
	$.fn.replaceSilently = (elem) ->
		elem = $(elem)
		source = this[0]
		target = elem[0]
		source.parentNode.replaceChild(target, source)
		become source, target
		elem
	
	
	become = (source, target) ->
		target[$.expando] = source[$.expando]
		# reattach events
		internals = $.hasData(target) and $(target).data()[$.expando]
		if internals and internals.events and internals.handle
			for type, info of internals.events
				if target.addEventListener
					target.addEventListener(type, internals.handle, false)
				else
					target.attachEvent("on", type, internals.handle)
	
	
	## HELPERS
	
	module.helpers = helpers = 
		escape: (value) ->
			value = String(value ? '')
			value.replace /&(?!\w+;)|["<>\\]/g, (s) ->
				switch s
					when "&" then "&amp;"
					when '"' then '&quot;'
					when "<" then "&lt;"
					when ">" then "&gt;"
					else s
	
	
	helpers.linkify = linkify = (text) ->
		for own name, type of linkify
			text = text.replace(type.regex, type.replace)
		text
	
	linkify.urls =
		regex: /(^|\s)(http(s)?:\/\/[^\s]+)/g
		replace: '$1<a href="$2" class="link" target="_blank">$2</a>'
	linkify.twitter =
		regex: /(^|\s)@(\w+)/g
		replace: '$1<a href="http://twitter.com/$2" class="twitter-link" target="_blank">@$2</a>'
	linkify.hash =
		regex: /(^|\s)#(\w+)/g
		replace: '$1<a href="http://twitter.com/#search?q=%23$2" class="hash-link" target="_blank">#$2</a>'
	
	
	
	return module