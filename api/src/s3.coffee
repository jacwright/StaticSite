key = null
secret = null
signedHeader = /^(versioning|location|acl|torrent|versionid)/
signedHeader.test = signedHeader.test.bind(signedHeader)

s3 = exports

s3.auth = (thekey, thesecret) ->
    key = thekey
    secret = thesecret
  
s3.bucket = (name) -> new S3Bucket(name)

s3.list = ->
    s3.request(type: 'get', url: '/').then(xmlToObj).then (results) ->
      results.buckets = results.buckets.bucket
      results.buckets = [results.buckets] unless results.buckets instanceof Array
      results
  
s3.request = (options = {}) ->
    
    options.headers = options.headers or {}
    for own name, value of options.headers
      lowered = name.toLowerCase()
      unless name is lowered
        delete options.headers[name]
        options.headers[lowered] = value
    
    options.type = options.type?.toLowerCase() or 'get'
    options.url = addQueryParams(options.url, options.params)
    resource = options.url.split('?')
    params = if resource.length > 1 then resource.pop().split('&') else []
    resource = addQueryParams(resource[0], params.filter(signedHeader.test))
    date = new Date().formatGMT('D, d M Y H:i:s \\G\\M\\T')
    contentType = options.contentType or ''
    contentMD5 = ''
    amz = []
    
    if contentType or (options.type is 'put' and options.data)
      unless contentType
        ext = url.split('?').shift().replace(/^.*\./, '').toLowerCase()
        contentType = options.headers['content-type'] or mimeTypes[ext] or 'application/octet-stream'
      
      options.headers['content-type'] = contentType
      md5 = forge.md5.create()
      if options.data instanceof ArrayBuffer
        md5.update String.fromCharCode.apply null, new Uint8Array options.data
      else
        md5.update options.data
      contentMD5 = options.headers['content-md5'] = btoa md5.digest().getBytes()
    
    
    options.headers['x-amz-date'] = date
    options.headers['x-amz-acl'] = options.acl if options.acl
    
    if options.metadata
      for own name, value of options.metadata
        value = value.replace(/\n/g, ' ') if typeof value is 'string'
        options.headers['x-amz-meta-' + name.toLowerCase()] = value
    
    for own name, value of options.headers
      if name.slice(0, 6) is 'x-amz-'
        amz.push(name + ':' + value)
    
    
    unless options.anonymous
      amzString = ''
      amzString = amz.sort().join('\n') + '\n' if amz.length
      
      stringToSign = [
        options.type.toUpperCase()
        contentMD5
        contentType
        '', # empty Date header, we're using x-amz-date instead for browser compatability
        amzString + resource
      ].join('\n')
      
      hmac = forge.hmac.create()
      hmac.start 'sha1', secret
      hmac.update forge.util.encodeUtf8 stringToSign
      signature = btoa hmac.digest().getBytes()
      options.headers['authorization'] = 'AWS ' + key + ':' + signature;
    
    $.ajax(options).fail (xhr) ->
      xml = $(xhr.responseText)
      if xml.find('code').text() is 'SignatureDoesNotMatch'
        console.error('Signature does not match, expected:\n', xml.find('StringToSign').text().replace(/\n/g, '\\n'), '\nactual:\n', stringToSign.replace(/\n/g, '\\n'));
      
      new Error(xml.find('message').text())
    



class S3Bucket
  
  constructor: (@name) ->
    @url = '/' + name + '/'
  
  list: (folder, options) ->
    url = @url
    options = $.extend options or {},
      type: 'get'
      url: url
    
    (options.params or (options.params = {})).prefix = folder if folder
    
    s3.request(options).then(xmlToObj).then (results) ->
      # if there is only one item (or less) in the list be sure to make it an array anyway
      # TODO, support paging when exceeding max-keys
      if results.contents instanceof Array
        results.contents
      else if results.contents
        [results.contents]
      else
        []
      
  
  get: (url, options) ->
    url = @url + url
    options = $.extend options or {},
      type: 'get'
      url: url
    
    s3.request(options)
      
  
  headers: (url, options) ->
    url = @url + url
    options = $.extend options or {},
      type: 'head'
      url: url
    
    s3.request(options).then (results, status, xhr) ->
      headerString = xhr.getAllResponseHeaders()
      headers = {}
      
      for header in headerString.split('\r\n')
        continue unless header
        [_, name, value] = header.match(/^([^:]+?)\s*:\s*(.*)$/)
        name = name.toLowerCase()
        if headers[name]
          if headers[name] instanceof Array
            headers[name].push(value)
          else
            headers[name] = [headers[name], value]
        else
          headers[name] = value if name
      
      headers
  
  
  put: (url, data, options = {}) ->
    url = @url + url
    options = $.extend options,
      type: 'put'
      url: url
      data: data
    
    s3.request(options)
  
  copy: (url, newUrl, options = {}) ->
    url = @url + url
    newUrl = @url + newUrl
    options = $.extend options,
      type: 'put'
      url: newUrl
      headers:
        'x-amz-copy-source': url
    
    s3.request(options)
  
  destroy: (url, options) ->
    url = this.url + url
    options = $.extend options || {},
      type: 'delete'
      url: url
    
    s3.request(options)


addQueryParams = (url, params) ->
  query = if params instanceof Array then params else []
  
  if params and params isnt query
    query.push name + '=' + encodeURIComponent(value) for own name, value of params
  
  if (index = url.indexOf('?')) isnt -1
    query = query.concat url.slice(index + 1).split('&')
    url = url.slice(0, index)
  
  
  if query.length
    query.sort()
    url += '?' + query.join('&')
  
  url



toType = (value) ->
  return value if typeof value isnt 'string'
  
  for type in types
    if (match = value.match(type.exp))
      return type.cast(match)
  
  value


types = [
  {
    exp: /^true|false$/
    cast: (match) -> match is 'true'
  }
  {
    exp: /^[\d\.]+$/
    cast: (match) -> parseFloat(match[0])
  }
  {
    exp: /^[\d\.]+$/
    cast: (match) -> parseFloat(match[0])
  }
  {
    exp: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/
    cast: (match) -> new Date(Date.UTC(match[1], parseInt(match[2]) + 1, match[3], match[4], match[5], match[6], match[7]))
  }
]

xmlToObj = (document) -> xmlToObjRecurse document.firstChild, {}


xmlToObjRecurse = (node, obj) ->
  return null unless node.childNodes.length
  
  len = node.childNodes.length
  
  for child in node.childNodes
    # if this node only contains text, just return the text
    return toType child.nodeValue if len is 1 and child.nodeType is 3
    
    name = child.nodeName.replace /^[A-Z]+/, (match) -> match.toLowerCase()
    
    if node.getElementsByTagName(child.tagName).length > 1
      # this is an array, create it and add to it
      obj[name] = [] unless obj[name]
      obj[name].push xmlToObjRecurse(child, {})
    else if child.nodeName and child.nodeName isnt '#cdata-section'
      obj[name] = xmlToObjRecurse(child, {})
  
  obj


isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

mimeTypes =
  "323": "text/h323"
  "acx": "application/internet-property-stream"
  "ai": "application/postscript"
  "aif": "audio/x-aiff"
  "aifc": "audio/x-aiff"
  "aiff": "audio/x-aiff"
  "asf": "video/x-ms-asf"
  "asr": "video/x-ms-asf"
  "asx": "video/x-ms-asf"
  "au": "audio/basic"
  "avi": "video/x-msvideo"
  "axs": "application/olescript"
  "bas": "text/plain"
  "bcpio": "application/x-bcpio"
  "bin": "application/octet-stream"
  "bmp": "image/bmp"
  "c": "text/plain"
  "cat": "application/vnd.ms-pkiseccat"
  "cdf": "application/x-cdf"
  "cer": "application/x-x509-ca-cert"
  "class": "application/octet-stream"
  "clp": "application/x-msclip"
  "cmx": "image/x-cmx"
  "cod": "image/cis-cod"
  "cpio": "application/x-cpio"
  "crd": "application/x-mscardfile"
  "crl": "application/pkix-crl"
  "crt": "application/x-x509-ca-cert"
  "csh": "application/x-csh"
  "css": "text/css"
  "dcr": "application/x-director"
  "der": "application/x-x509-ca-cert"
  "dir": "application/x-director"
  "dll": "application/x-msdownload"
  "dms": "application/octet-stream"
  "doc": "application/msword"
  "dot": "application/msword"
  "dvi": "application/x-dvi"
  "dxr": "application/x-director"
  "eps": "application/postscript"
  "etx": "text/x-setext"
  "evy": "application/envoy"
  "exe": "application/octet-stream"
  "fif": "application/fractals"
  "flr": "x-world/x-vrml"
  "gif": "image/gif"
  "gtar": "application/x-gtar"
  "gz": "application/x-gzip"
  "h": "text/plain"
  "hdf": "application/x-hdf"
  "hlp": "application/winhlp"
  "hqx": "application/mac-binhex40"
  "hta": "application/hta"
  "htc": "text/x-component"
  "htm": "text/html"
  "html": "text/html"
  "htt": "text/webviewhtml"
  "ico": "image/x-icon"
  "ief": "image/ief"
  "iii": "application/x-iphone"
  "ins": "application/x-internet-signup"
  "isp": "application/x-internet-signup"
  "jfif": "image/pipeg"
  "jpe": "image/jpeg"
  "jpeg": "image/jpeg"
  "jpg": "image/jpeg"
  "js": "application/x-javascript"
  "latex": "application/x-latex"
  "lha": "application/octet-stream"
  "lsf": "video/x-la-asf"
  "lsx": "video/x-la-asf"
  "lzh": "application/octet-stream"
  "m13": "application/x-msmediaview"
  "m14": "application/x-msmediaview"
  "m3u": "audio/x-mpegurl"
  "man": "application/x-troff-man"
  "mdb": "application/x-msaccess"
  "me": "application/x-troff-me"
  "mht": "message/rfc822"
  "mhtml": "message/rfc822"
  "mid": "audio/mid"
  "mny": "application/x-msmoney"
  "mov": "video/quicktime"
  "movie": "video/x-sgi-movie"
  "mp2": "video/mpeg"
  "mp3": "audio/mpeg"
  "mpa": "video/mpeg"
  "mpe": "video/mpeg"
  "mpeg": "video/mpeg"
  "mpg": "video/mpeg"
  "mpp": "application/vnd.ms-project"
  "mpv2": "video/mpeg"
  "ms": "application/x-troff-ms"
  "mvb": "application/x-msmediaview"
  "nws": "message/rfc822"
  "oda": "application/oda"
  "p10": "application/pkcs10"
  "p12": "application/x-pkcs12"
  "p7b": "application/x-pkcs7-certificates"
  "p7c": "application/x-pkcs7-mime"
  "p7m": "application/x-pkcs7-mime"
  "p7r": "application/x-pkcs7-certreqresp"
  "p7s": "application/x-pkcs7-signature"
  "pbm": "image/x-portable-bitmap"
  "pdf": "application/pdf"
  "pfx": "application/x-pkcs12"
  "pgm": "image/x-portable-graymap"
  "pko": "application/ynd.ms-pkipko"
  "pma": "application/x-perfmon"
  "pmc": "application/x-perfmon"
  "pml": "application/x-perfmon"
  "pmr": "application/x-perfmon"
  "pmw": "application/x-perfmon"
  "pnm": "image/x-portable-anymap"
  "pot,": "application/vnd.ms-powerpoint"
  "ppm": "image/x-portable-pixmap"
  "pps": "application/vnd.ms-powerpoint"
  "ppt": "application/vnd.ms-powerpoint"
  "prf": "application/pics-rules"
  "ps": "application/postscript"
  "pub": "application/x-mspublisher"
  "qt": "video/quicktime"
  "ra": "audio/x-pn-realaudio"
  "ram": "audio/x-pn-realaudio"
  "ras": "image/x-cmu-raster"
  "rgb": "image/x-rgb"
  "rmi": "audio/mid"
  "roff": "application/x-troff"
  "rtf": "application/rtf"
  "rtx": "text/richtext"
  "scd": "application/x-msschedule"
  "sct": "text/scriptlet"
  "setpay": "application/set-payment-initiation"
  "setreg": "application/set-registration-initiation"
  "sh": "application/x-sh"
  "shar": "application/x-shar"
  "sit": "application/x-stuffit"
  "snd": "audio/basic"
  "spc": "application/x-pkcs7-certificates"
  "spl": "application/futuresplash"
  "src": "application/x-wais-source"
  "sst": "application/vnd.ms-pkicertstore"
  "stl": "application/vnd.ms-pkistl"
  "stm": "text/html"
  "svg": "image/svg+xml"
  "sv4cpio": "application/x-sv4cpio"
  "sv4crc": "application/x-sv4crc"
  "swf": "application/x-shockwave-flash"
  "t": "application/x-troff"
  "tar": "application/x-tar"
  "tcl": "application/x-tcl"
  "tex": "application/x-tex"
  "texi": "application/x-texinfo"
  "texinfo": "application/x-texinfo"
  "tgz": "application/x-compressed"
  "tif": "image/tiff"
  "tiff": "image/tiff"
  "tr": "application/x-troff"
  "trm": "application/x-msterminal"
  "tsv": "text/tab-separated-values"
  "txt": "text/plain"
  "uls": "text/iuls"
  "ustar": "application/x-ustar"
  "vcf": "text/x-vcard"
  "vrml": "x-world/x-vrml"
  "wav": "audio/x-wav"
  "wcm": "application/vnd.ms-works"
  "wdb": "application/vnd.ms-works"
  "wks": "application/vnd.ms-works"
  "wmf": "application/x-msmetafile"
  "wps": "application/vnd.ms-works"
  "wri": "application/x-mswrite"
  "wrl": "x-world/x-vrml"
  "wrz": "x-world/x-vrml"
  "xaf": "x-world/x-vrml"
  "xbm": "image/x-xbitmap"
  "xla": "application/vnd.ms-excel"
  "xlc": "application/vnd.ms-excel"
  "xlm": "application/vnd.ms-excel"
  "xls": "application/vnd.ms-excel"
  "xlt": "application/vnd.ms-excel"
  "xlw": "application/vnd.ms-excel"
  "xof": "x-world/x-vrml"
  "xpm": "image/x-xpixmap"
  "xwd": "image/x-xwindowdump"
  "z": "application/x-compress"
  "zip": "application/zip"


processMimeTypes = ->
  navigator.mimeTypes.forEach (mimeType) ->
    return unless mimeType.suffixes
    
    type = mimeType.type
    mimeType.suffixes.split(',').forEach (suffix) ->
      mimeTypes[suffix] = type unless mimeTypes.hasOwnProperty(suffix)

try
  processMimeTypes()
catch e
