fs = require 'fs'
exec = require('child_process').exec
uglify = require 'uglify-js'
coffee = require 'coffee-script'
templater = require './lib/templater'
watch = require 'watch'
knox = require 'knox'

		
ansi =
	green: '\033[32m'
	red: '\033[31m'
	yellow: '\033[33m'
	none: '\033[0m'

bucket = knox.createClient
	key: process.env.AWS_ACCESS_KEY_ID
	secret: process.env.AWS_SECRET_ACCESS_KEY
	bucket: process.env.AWS_DEFAULT_BUCKET



getDest = (file) ->
	file.replace(/src/, 'public/admin/js')


compile = (file) ->
	ext = file.split('.').pop()
	dest = getDest(file)
	dest = dest.replace('.' + ext, '.js')
	destFolder = dest.replace(/\/[^\/]+$/, '')
	
	if ext is 'coffee'
		try
			fs.writeFileSync dest, coffee.compile(fs.readFileSync(file, 'utf8'))
			console.log 'compiled:', ansi.green, dest, ansi.none
		catch e
			console.error 'error:', ansi.red, e.message, ansi.none
	else if ext is 'tmpl'
		name = file.split('/').pop().split('.').shift()
		fs.writeFileSync dest, templater.compile(name, fs.readFileSync(file, 'utf8'))
		console.log 'compiled:', ansi.green, dest, ansi.none


remove = (file) ->
	ext = file.split('.').pop()
	dest = getDest(file)
	
	if ext
		dest = dest.replace('.' + ext, '.js')
		fs.unlink dest, -> console.log 'deleted:', ansi.green, dest, ansi.none
	else
		fs.rmdir dest, -> console.log 'deleted:', ansi.green, dest, ansi.none


handleS3Result = (cb, err, res) ->
	if error
		console.error ansi.red, error, ansi.none
	else if res.statusCode isnt 200 and res.statusCode isnt 204
		res.setEncoding('utf8')
		error = ''
		res.on 'data', (chunk) -> error += chunk
		res.on 'end', ->
			error = error.replace(/[\s\S]+<Message>([^<]+)<\/Message>[\s\S]+/, '$1')
			console.error ansi.yellow, error, ansi.none
	else
		cb()


uploadFile = (path) ->
	remotePath = path.replace(/^public/, '')
	remotePath = '/admin/' if remotePath is '/admin/index.html'
	
	bucket.putFile path, remotePath, handleS3Result.bind null, ->
		growlNotify(remotePath)
		console.log 'uploaded:', ansi.green, path, ansi.none


deleteFile = (path) ->
	remotePath = path.replace(/^public/, '')
	remotePath = '/admin/' if remotePath is '/admin/index.html'
	
	bucket.deleteFile remotePath, handleS3Result.bind null, ->
		console.log 'deleted:', ansi.green, path, ansi.none

notifications = []
timeout = null
growlNotify = (uploaded) ->
	notifications.push(uploaded.replace('/admin/', ''))
	return if timeout
	timeout = setTimeout ->
		exec('growlnotify -m "' + notifications.join('\n') + '" "Uploaded"')
		notifications = []
		timeout = null
	, 1000

task 'watch', 'Watch scripts for changes and compile them when they change', ->
	
	watch.createMonitor 'src', interval: 100, (monitor) ->
		for f, stat of monitor.files
			if stat.isDirectory()
				try
					fs.mkdirSync(getDest(f))
				catch e
			else
				compile(f) 
		
		console.log 'watching...'
		
		monitor.on 'created', (f, curr, prev) ->
			if curr.isDirectory()
				dest = getDest(f)
				fs.mkdirSync(dest)
				console.log 'created: ' + dest
			else
				compile(f)
		
		monitor.on 'changed', (f, curr, prev) ->
			compile(f) unless curr.isDirectory()
		
		monitor.on 'removed', (f, curr, prev) ->
			remove(f)
	
	
	watch.createMonitor 'public', interval: 100, (monitor) ->
		for f, stat of monitor.files
			unless stat.isDirectory()
				uploadFile(f) 
		
		monitor.on 'created', (f, curr, prev) ->
			uploadFile(f) unless curr.isDirectory()
		
		monitor.on 'changed', (f, curr, prev) ->
			uploadFile(f) unless curr.isDirectory()
		
		monitor.on 'removed', (f, curr, prev) ->
			deleteFile(f) unless curr.isDirectory()
	

