define ['./file', './folder', 'lib/promises'], (File, Folder, promises) ->
	
	settingsCID = null
	
	class AdminFolder extends Folder
		icon: 'folder-wrench'
		@prop 'site'
		
		constructor: (args...) ->
			super(args...)
			
			settings = new SettingsFile
			@children.add settings
			
			@on 'change:site', =>
				settings.site = @site
		
		
		@match: (attr) ->
			attr.key is 'admin/'
		
	
	
	class SettingsFile extends File
		icon: 'page-white-wrench'
		nonStandard: true
		
		constructor: (attr, opts) ->
			attr ?= {}
			attr.key = 'admin/settings'
			super(attr, opts)
			settingsCID = @cid
			@content = 'Settings page here'
			
		fetch: ->
			deferred = new promises.Deferred
			deferred.fulfill @
			deferred.promise
	
	
	class TemplatesFolder extends Folder
		nonStandard: true
		
		@match: (attr) ->
			attr.key is 'admin/templates/'
	
	
	
	
	class HiddenFiles extends File
		
		constructor: (attr, opts) ->
			super(attr, opts)
			# make the cid of these files the same as the settings file so they'll be thrown out, or hidden
			@cid = settingsCID
		
		@match: (attr) ->
			matches = attr.key.indexOf('admin/') is 0 and attr.key.indexOf('admin/templates') isnt 0
			if matches
				console.log attr.key, 'matches'
			return matches
	
	
	
	
	File.subclasses.push(HiddenFiles)
	File.subclasses.push(AdminFolder)
	File.subclasses.push(TemplatesFolder)
	
	
	return AdminFolder