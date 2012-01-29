fs = require 'fs'
browserify = require 'browserify'
uglify = require 'uglify-js'
exec = require('child_process').exec

base = "#{__dirname}/src/admin/js"
watching = false


package = (files, output) ->
	bundle = browserify(watch: if watching then interval: 1000 else false)
	if (files.minify)
		bundle.register 'post', uglify
		delete files.minify
	
	for own method, value of files
		value = [value] unless value instanceof Array
		for file in value
			bundle[method](file)
	
	write = ->
		fs.writeFileSync output, bundle.bundle()
		console.log(ansi.green, 'Wrote', output, ansi.none)
		exec('growlnotify -m "' + output.split('/').pop() + ' has been recompiled." "Recompile"')
	
	if watching
		bundle.on 'bundle', -> write()
	else
		write()
		

ansi =
	green: '\033[32m'
	red: '\033[31m'
	yellow: '\033[33m'
	none: '\033[0m'


task 'compile', 'Compile the scripts into one using browserify', ->
	app = 
		require: [
			"#{base}/src/app"
			"#{base}/src/view"
		]
	login = require: "#{base}/src/login"
	register = require: "#{base}/src/register"
	
	
	package app, "#{base}/app.js"
	package login, "#{base}/login.js"
	package register, "#{base}/register.js"
	
#	app.minify = login.minify = true
#	package app, "#{base}/app.min.js"
#	package login, "#{base}/login.min.js"
	


task 'watch', 'Watch scripts for changes and compile them when they change', ->
	console.log 'watching...'
	watching = true
	
	invoke 'compile'
	
	

