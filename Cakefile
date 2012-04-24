fs = require 'fs'
exec = require('child_process').exec
uglify = require 'uglify-js'
coffee = require 'coffee-script'
templater = require './lib/templater'
watch = require 'watch'
knox = require 'knox'
bucket = null
		
ansi =
	green: '\033[32m'
	red: '\033[31m'
	yellow: '\033[33m'
	none: '\033[0m'


getBucket = (options) ->
	config =
		key: options.key or process.env.AWS_ACCESS_KEY_ID
		secret: options.secret or process.env.AWS_SECRET_ACCESS_KEY
		bucket: options.bucket or process.env.AWS_DEFAULT_BUCKET
	
	if config.key and config.secret and config.bucket
		knox.createClient config
	else
		false



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
	if err
		console.error ansi.red, err, ansi.none
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
	if path.slice(-1) is '/'
		isDir = true
	
	remotePath = path.replace(/^public/, '')
	return if remotePath is '/' or remotePath is '/admin/'
	remotePath = '/admin/' if remotePath is '/admin/main.html'
	
	if isDir
		req = bucket.put(remotePath, 'Content-Length': 0).on('response', handleS3Result.bind null, ->
			growlNotify(remotePath)
			console.log 'uploaded:', ansi.green, path, ansi.none
		, null).end()
	else
		bucket.putFile path, remotePath, handleS3Result.bind null, ->
			growlNotify(remotePath)
			console.log 'uploaded:', ansi.green, path, ansi.none


deleteFile = (path) ->
	remotePath = path.replace(/^public/, '')
	remotePath = '/admin/' if remotePath is '/admin/main.html'
	
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






option '-k', '--key [KEY]', 'AWS access key id. Will attempt to use the environment variable AWS_ACCESS_KEY_ID if not provided.'
option '-s', '--secret [SECRET]', 'AWS secret access key. Will attempt to use the environment variable AWS_SECRET_ACCESS_KEY if not provided.'
option '-b', '--bucket [BUCKET]', 'S3 bucket to upload to. Will attempt to use the environment variable AWS_DEFAULT_BUCKET if not provided.'


task 'make', 'Compile scripts and upload them', (options) ->
	bucket = getBucket(options)
	
	watch.walk 'src', (err, files) ->
		for filename, stat of files
			if stat.isDirectory()
				try
					fs.mkdirSync(getDest(filename))
				catch e
			else
				compile(filename)
		
		unless bucket
			console.log 'key, secret, and/or bucket undefined, will not upload'
			return
		
		watch.walk 'public', (err, files) ->
			for filename, stat of files
				filename += '/' if stat.isDirectory()
				uploadFile(filename)




task 'watch', 'Watch scripts and files for changes and compile and upload them when they change', (options) ->
	bucket = getBucket(options)
	
	watch.createMonitor 'src', interval: 100, (monitor) ->
		for filename, stat of monitor.files
			if stat.isDirectory()
				try
					fs.mkdirSync(getDest(filename))
				catch e
			else
				compile(filename) 
		
		console.log 'watching...'
		
		monitor.on 'created', (filename, curr, prev) ->
			if curr.isDirectory()
				dest = getDest(filename)
				fs.mkdirSync(dest)
				console.log 'created:', dest
			else
				compile(filename)
		
		monitor.on 'changed', (filename, curr, prev) ->
			compile(filename) unless curr.isDirectory()
		
		monitor.on 'removed', (filename, curr, prev) ->
			remove(filename)
	
	unless bucket
		console.log 'key, secret, and/or bucket undefined, will not upload'
		return
	
	watch.createMonitor 'public', interval: 100, (monitor) ->
		for filename, stat of monitor.files
			filename += '/' if stat.isDirectory()
			uploadFile(filename)
		
		monitor.on 'created', (filename, curr, prev) ->
			filename += '/' if stat.isDirectory()
			uploadFile(filename)
		
		monitor.on 'changed', (filename, curr, prev) ->
			filename += '/' if stat.isDirectory()
			uploadFile(filename)
		
		monitor.on 'removed', (filename, curr, prev) ->
			filename += '/' if stat.isDirectory()
			deleteFile(filename)
	

