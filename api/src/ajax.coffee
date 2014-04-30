ajax = jQuery.ajax
lastXhr = null

attachXhr = (promise, xhr) ->
  thens = promise.then
  promise.jqXHR = xhr
  promise.then = ->
    attachXhr thens.apply(this, arguments), xhr
  promise


jQuery.ajax = (url, options) ->
  jqXHR = ajax(url, options)
  return jqXHR unless lastXhr

  deferred = jQuery.Deferred()
  jqXHR.then (success, statusText, jqXHR) ->
    deferred.resolveWith this, [success, statusText, jqXHR]
  , (jqXHR, statusText, error) ->
    deferred.rejectWith this, [jqXHR, statusText, error]
  
  deferred.promise(jqXHR)
  jqXHR.success = jqXHR.done
  jqXHR.error = jqXHR.fail
  
  lastXhr.deferred = deferred
  lastXhr = null
  window.jqXHR = jqXHR
  attachXhr jqXHR, jqXHR


jQuery.ajaxTransport '+*', (options, originalOptions, jqXHR) ->
  dataType = options.dataType or 'text'
  return unless dataType is 'blob' or
      dataType is 'arraybuffer' or
      dataType is 'text' or
      dataType is 'json' or
      originalOptions.data instanceof Blob
      originalOptions.data instanceof ArrayBuffer
      originalOptions.data instanceof Uint8Array
  return unless {blob: true, arraybuffer: true, text: true, json: true}[dataType]
  xhr = null

  removeCallbacks = ->
    if xhr
      xhr.onload = xhr.onerror = null

  # Cross domain only allowed if supported through XMLHttpRequest
  send: (headers, complete) ->
    xhr = lastXhr = options.xhr()

    xhr.open options.type, options.url, options.async, options.username, options.password
    unless dataType is 'text' or dataType is 'json'
      xhr.responseType = dataType

    # Apply custom fields if provided
    if options.xhrFields
      for key, value of options.xhrFields
        xhr[key] = value

    # Override mime type if needed
    if options.mimeType and xhr.overrideMimeType
      xhr.overrideMimeType options.mimeType

    # X-Requested-With header
    if not options.crossDomain and not headers['X-Requested-With']
      headers['X-Requested-With'] = 'XMLHttpRequest'

    # Set headers
    for key, value of headers
      xhr.setRequestHeader key, value

    # Listen to events
    xhr.onload = ->
      removeCallbacks()
      status = xhr.status or 200 # file protocol always yields status code 0, assume 200
      status = 204 if status is 1223 # sometimes IE9 returns 1223 when it should be 204
      response = {}
      response[dataType] = xhr.response
      complete status, xhr.statusText, response, xhr.getAllResponseHeaders()

    xhr.onerror = ->
      removeCallbacks()
      complete xhr.status, xhr.statusText

    xhr.upload.onprogress = (event) ->
      xhr.deferred?.notify direction: 'up', loaded: event.loaded, total: event.total
  
    xhr.onprogress = (event) ->
      xhr.deferred?.notify direction: 'down', loaded: event.loaded, total: event.total

    try
      # Do send the request (this may raise an exception)
      if originalOptions.data instanceof ArrayBuffer
        options.data = new Uint8Array originalOptions.data
      else if originalOptions.data instanceof Uint8Array or originalOptions.data instanceof Blob
        options.data = originalOptions.data
      xhr.send options.hasContent and options.data or null
    catch e
      # #14683: Only rethrow if this hasn't been notified as an error yet
      if xhr.onerror
        throw e

  abort: ->
    removeCallbacks()
    xhr.abort()
   