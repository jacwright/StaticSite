require('ajax')
s3 = require('s3')

window.staticsite = staticsite = exports
currentBucket = null
try
  cache = JSON.parse(localStorage.getItem 'fileCache') or {}
catch e
  cache = {}


events = $(staticsite)
staticsite.trigger = -> events.trigger.apply(events, arguments);staticsite
staticsite.on = -> events.on.apply(events, arguments);staticsite
staticsite.one = -> events.one.apply(events, arguments);staticsite
staticsite.off = -> events.off.apply(events, arguments);staticsite


staticsite.auth = (key, secret) ->
  s3.auth(key, secret)

staticsite.listSites = ->
  s3.list().then (result) ->
    result.buckets.filter(filterOutNonSites).map objectToSite


staticsite.use = (site) ->
  sitename = site.name or site
  currentBucket = s3.bucket(sitename)


staticsite.loadSite = (site) ->
  staticsite.use site
  bucket = currentBucket
  bucket.list().then (result) ->
    siteCache = cache[bucket.name] or {}
    promises = result.map (obj) ->
      file = objectToFile obj
      # only reload file info if it has changed since we last loaded
      if (fileInfo = siteCache[file.filename]) and fileInfo.modifiedTimestamp is file.lastModified.getTime()
        file.contentType = fileInfo.contentType
        file.private = fileInfo.private
        file.metadata = fileInfo.metadata
        file
      else
        loadFileInfo(file)

    $.when(promises...).then (files...) ->
      updateCache bucket.name, files
      new FileList bucket.name, files


staticsite.createFile = (filename) ->
  unless currentBucket
    throw new Error('No site selected, call staticsite.use(sitename) first.')
  file = new File(currentBucket)
  file.setFilename filename


staticsite.saveFile = (file) ->
  bucket = file.bucket or bucket
  unless bucket
    throw new Error('No site selected, call staticsite.use(sitename) first.')
  throw new TypeError('File must have "filename" to save') unless file.filename
  throw new TypeError('File must have "contents" set (even if only to an empty string) to save') unless file.contents?
  event = $.Event 'fileSaving', target: file
  staticsite.trigger event
  return $.Deferred().reject('prevented').promise() if event.isDefaultPrevented()

  metadata = {}
  for own key, value of file.metadata
    key = key.replace /([A-Z])/g, '-$1'
    metadata[key] = JSON.stringify value

  options =
    acl: if file.private then 'private' else 'public-read'
    contentType: file.contentType
    metadata: metadata

  promise = bucket.put(file.filename, file.contents, options)
  promise.then ->
    staticsite.trigger type: 'fileSaved', target: file
  staticsite.trigger type: 'fileSave', target: file, promise: promise
  promise


staticsite.deleteFile = (file) ->
  bucket = file.bucket or bucket
  unless bucket
    throw new Error('No site selected, call staticsite.use(sitename) first.')
  event = $.Event 'fileDeleting', target: file
  staticsite.trigger event
  return $.Deferred.resolve().promise() if event.isDefaultPrevented()
  
  promise = bucket.destroy(file.filename)
  promise.then ->
    staticsite.trigger type: 'fileDeleted', target: file
  staticsite.trigger type: 'fileDelete', target: file, promise: promise
  promise


staticsite.loadFileContents = (file) ->
  bucket = file.bucket or bucket
  unless bucket
    throw new Error('No site selected, call staticsite.use(sitename) first.')
  
  unless file.contentType.indexOf('text') is 0 or file.contentType.indexOf('json') isnt -1
    options = dataType: 'arraybuffer'

  bucket.get(file.filename, options).then (contents) ->
    file.contents = contents



staticsite.imageFromFile = (file) ->
  unless file.contents?
    throw new TypeError('File must have contents loaded')
  unless file.contents instanceof ArrayBuffer
    throw new TypeError('File contents must be an ArrayBuffer')
  image = new Image()
  image.src = 'data:' + file.contentType + ';base64,' + file.contents.toBase64()
  image


class Site


class File
  constructor: (@bucket) ->

  setFilename: (filename) ->
    @filename = filename
    @name = filename.replace(/\/+$/, '').split(/\//).pop()
    @extension = @name.replace /^.+?(?:\.(\w+))?$/, '$1'
    @isFolder = @filename.slice(-1) is '/'
    this
  
  setName: (name) ->
    setFilename (@filename or '').replace /[^\/]*\/?$/, name

  save: -> staticsite.saveFile this
  delete: -> staticsite.deleteFile this
  loadContents: -> staticsite.loadFileContents this


# a representation of a folder for when no file exists by that folder name
class GhostFolder
  constructor: (filename) ->
    @setFilename filename
  
  setFilename: File::setFilename


class FileList
  @sort: (a, b) ->
    return -1 if a.isFolder and not b.isFolder
    return 1 if not a.isFolder and b.isFolder
    aName = a.name.toLowerCase()
    bName = b.name.toLowerCase()
    return -1 if aName < bName
    return 1 if aName > bName
    return 0

  constructor: (@siteName, @files) ->

  list: (prefix = '', includeGhostFolders) ->
    list = {}
    @files.forEach (file) ->
      return if file.filename.indexOf(prefix) isnt 0 or file.filename is prefix
      relative = file.filename.replace prefix, ''
      rest = relative.split('/')
      dirName = rest[0] + '/'
      if relative is dirName
        list[dirName] = file
      else if rest.length is 1
        list[relative] = file
      else if includeGhostFolders and not list[dirName]
        list[dirName] = new GhostFolder(prefix + dirName)

    Object.keys(list).map((key) -> list[key]).sort(FileList.sort)



# Utilities

filterOutNonSites = (obj) ->
  /\w+\.\w+/.test obj.name


objectToSite = (obj) ->
  site = new Site()
  site.name = obj.name
  site.creationDate = obj.creationDate
  site

objectToFile = (obj) ->
  file = new File(currentBucket)
  file.setFilename obj.key
  file.md5 = obj.etag
  file.lastModified = obj.lastModified
  file

loadFileInfo = (file) ->
  file.bucket.headers(file.filename).then (headers) ->
    file.contentType = headers['content-type']
    file.private = headers['x-amz-acl'] is 'private'
    file.metadata = {}
    for own name, value of headers
      if name.indexOf('x-amz-meta-') is 0
        try
          value = JSON.parse value
        catch e
        name = name.replace('x-amz-meta-', '').replace /-([a-z])/g, (_, char) ->
          char.toUpperCase()
        file.metadata[name] = value
    file


loadCache = ->
  cache = JSON.parse(localStorage.getItem 'fileCache') or {}

updateCache = (sitename, files) ->
  cache[sitename] = siteCache = {}
  files.forEach (file) ->
    siteCache[file.filename] =
      contentType: file.contentType
      private: file.private
      metadata: file.metadata
      modifiedTimestamp: file.lastModified.getTime()
  localStorage.setItem 'fileCache', JSON.stringify cache

# ArrayBuffer utilities
Object.defineProperties ArrayBuffer.prototype,
  getBytes:
    writable: true
    configureable: true
    value: -> new Uint8Array this
  toBinaryString:
    writable: true
    configureable: true
    value: -> String.fromCharCode.apply null, @getBytes()
  toBase64:
    writable: true
    configureable: true
    value: -> btoa @toBinaryString()

ArrayBuffer.fromBytes = (bytes) ->
  buffer = new ArrayBuffer bytes.length
  buffer.getBytes().set(bytes)
  buffer

ArrayBuffer.fromBinaryString = (string) ->
  ArrayBuffer.fromBytes string.split('').map (char) -> char.charCodeAt 0

ArrayBuffer.fromBase64 = (base64) ->
  ArrayBuffer.fromBinaryString atob base64
