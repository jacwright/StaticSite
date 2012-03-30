define ['./file'], (File) ->
	
	
	class Folder extends File
		icon: 'folder'
		isFolder: true
		
		@match: (attr) ->
			attr.key.slice(-1) is '/'
		
	
	File.subclasses.push(Folder)
	
	return Folder