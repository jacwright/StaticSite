fs = require 'fs'
stitch = require 'stitch'
spawn = require('child_process').spawn
watch = require('./lib/file-watcher').watch


base = "#{__dirname}/src/admin/js"


task 'compile', 'Compile the scripts into one using browserify', ->
	
	browserify = require 'browserify'
	bundle = browserify()
	bundle.require "#{base}/src/app"
	bundle.require "#{base}/src/view"
	
	file = "#{base}/app.js"
	fs.writeFileSync file, bundle.bundle()
	
	console.log(ansi.green + 'Done!', ansi.none) if watching
	
	compile = file.replace(/js$/, 'min.js');
	bundle.register 'post', require 'uglify-js'
	fs.writeFileSync compile, bundle.bundle()
	
	
	bundle = browserify()
	bundle.require "#{base}/src/login"
	
	file = "#{base}/login.js"
	fs.writeFileSync file, bundle.bundle()
	
	console.log(ansi.green + 'Login done!', ansi.none) if watching
	
	compile = file.replace(/js$/, 'min.js');
	bundle.register 'post', require 'uglify-js'
	fs.writeFileSync compile, bundle.bundle()
	


watching = false

task 'watch', 'Watch scripts for changes and compile them when they change', ->
	console.log 'watching...'
	watching = true
	
	watchOptions =
		filter: (file) ->
			not /^admin\./.test(file) or /\.(coffee|js)$/.test file
	
	
	watch "#{base}/src", watchOptions, ->
		try
			console.log 'compiling'
			invoke 'compile'
		catch e
			console.error ansi.red + 'Error:', e.message, ansi.none
	
	




ansi =
	green: '\033[32m'
	red: '\033[31m'
	yellow: '\033[33m'
	none: '\033[0m'