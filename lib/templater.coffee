coffeescript = require('coffee-script')


camelize = (str) ->
	str.replace /-+(.)?/g, (match, chr) ->
		if chr then chr.toUpperCase() else ''


chunk = /([\s\S]+?)(<%|%>|$)/g
newline = /\r\n|\r|\n/g
trim = /^\s+|\s+$/g
processText = (str) ->
	str = str.replace /('|\\)/g, '\\$1'
	str.replace /\t/g, '\\t'


exports.compile = compile = (name, source, opts = {}) ->
	func = []
	indent = ''
	func.push("#{indent}name = " + JSON.stringify(name))
	func.push("#{indent}source = " + JSON.stringify(source))
	func.push('try')
	indent = '\t'
	lineNumber = 1
	func.push("#{indent}__line = 1") if not opts.optimize
	func.push("#{indent}__lines = []")
	
	# start off as text or code
	mode = 'text'
	if source.slice(0, 2) is '<%'
		mode = 'code'
		source = source.slice(2)
	
	
	while match = chunk.exec source
		content = match[1]
		end = match[2]
		
		# handle the case when two code blocks are next to each other
		if mode is 'text' and content.slice(0, 2) is '<%'
			mode = 'code'
			content = content.slice 2
		
		if mode is 'text'
			continue if end is '%>'
			text = processText content
			newlineReplace = if opts.optimize then "\\n" else (match) -> "\\n'\n#{indent}__line = #{++lineNumber}\n#{indent}__lines.push '"
			text = text.replace(newline, newlineReplace)
			func.push("#{indent}__lines.push '#{text}'")
			mode = 'code'
		else
			code = content.replace trim, ''
			if content.slice(0, 2) is ':='
				func.push("#{indent}__lines.push(#{code.slice(2)})")
			else if content.slice(0, 1) is '='
				func.push("#{indent}__lines.push @escape(#{code.slice(1)})")
			else if code is 'end'
				indent = indent.slice(0, -1)
			else
				indent = indent.slice(0, -1) if code.split(/[\s:]+/).shift() is 'else'
				newlineReplace = if opts.optimize then "\n#{indent}" else (match) -> "\n#{indent}__line = #{++lineNumber}\n#{indent}"
				code = code.replace(newline, "\n#{indent}")
				func.push("#{indent}#{code.replace /:$/, ''}")
				if code.slice(-1) is ':' or code.slice(-2) is '->'
					indent += '\t'
			mode = 'text'
	
	func.push("#{indent}return __lines.join ''")
	func.push("catch error")
	func.push("#{indent}lines = source.split /\\n/")
	func.push("#{indent}for line, i in lines")
	func.push("\t#{indent}lineNumber = if i < 9 then '  ' + (i + 1) else if i < 109 then ' ' + (i + 1) else i + 1")
	func.push("\t#{indent}lines[i] = (if i is __line - 1 then \"=>|\#{lineNumber}|\" else \"  |\#{lineNumber}|\") + line")
	func.push("#{indent}error.message += '\\nin template ' + name + ' on line ' + __line + '\\n' + lines.join('\\n')")
	func.push("#{indent}throw error")
	src = func.join '\n'
	
	try
		js = coffeescript.compile(src).replace(/^\(function\(\) \{\n|\n\}\)\.call\(this\);\n$/g, '')
	catch error
		lines = src.split /\n/
		currentLine = error.message.match(/on line (\d+)/)?.pop()
		currentLine = parseInt currentLine if currentLine?
		for line, i in lines
			num = i + 1
			lineNumber = (if num < 10 then '  ' + num else if num < 100 then ' ' + num else num)
			lines[i] = (if num is currentLine then "=>|#{lineNumber}|" else "  |#{lineNumber}|") + line
		error.message += " when compiling template #{name}. Source:\n\n#{lines.join '\n'}"
		throw error
	
	funcName = camelize(name)
	compiled = Function('data', 'index', js).toString().replace('anonymous', funcName)
	
	"define(['lib/templates'], function (templates) {\n\n#{compiled}\n\nreturn templates.get.bind(null, #{funcName}.bind(templates.helpers));\n\n});"

	