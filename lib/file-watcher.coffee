fs = require 'fs'

exports.watch = (folders, options, callback) ->
	folders = [folders] if not (folders instanceof Array)
	if typeof options is 'function'
		callback = options
		options = {}
	options ?= {}
	callback ?= ->
	
	watching = {}
	filter = options.filter ? -> true
	ignore = options.ignore ? -> false
	interval = options.interval ? 1000
	refreshInterval = options.interval ? 5000
	verbose = options.verbose ? false
	
	
	
	readDir = (dir, initial) ->
		fs.readdir dir, (err, dirFiles) ->
			for file in dirFiles
				do (file) ->
					return if file.charAt(0) is '.'
					inspect(dir + '/' + file, initial)
	
	
	setupWatch = (path) ->
		console.log 'watching:', path if verbose
		watching[path] = true;
		fs.watchFile path, { interval: interval }, (curr, prev) ->
			if curr.nlink is 0 #deleted
				fs.unwatchFile path
				delete watching[path]
				console.log 'not watching:', path if verbose
			
			if curr.mtime.getTime() isnt prev.mtime.getTime() # add any new files
				callback path
	
	
	inspect = (path, initial) ->
		return if watching[path]
		
		fs.stat path, (err, stats) ->
			if stats.isDirectory()
				readDir(path, initial) unless ignore(path)
			else
				if filter(path) is yes
					setupWatch path
					callback(path) unless initial
	
	
	run = ->
		inspect(folder, true) for folder in folders
	
			
	run()
	setInterval run, refreshInterval