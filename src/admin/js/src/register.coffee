auth = require('./app/auth')

# ensure we are at the correct domain
if location.protocol isnt 'https:' or location.host isnt 's3.amazonaws.com'
	location.href = "https://s3.amazonaws.com/#{location.host}#{location.pathname}"
	throw new Error('Cannot administer site from this location.')


# view code
$ ->
	$('div.alert-message').hide()
	
	$('#key').focus()
	
	$('#registerform').submit (event) ->
		event.preventDefault()
		$('#alerts').slideUp('fast')
		
		# process sign-in
		key = $('#key').val()
		secret = $('#secret').val()
		username = $('#username').val()
		password = $('#password').val()
		rememberme = $('#rememberme').attr('checked')
		
		auth.register(key, secret, username, password).then ->
			auth.login(username, password, rememberme).then ->
				location.href = './'
			, (err) ->
				$('#alerts').slideDown('fast').find('.msg').text(err.message)
		, (err) ->
			$('#alerts').slideDown('fast').find('.msg').text(err.message)
		
	
	$('#registerform').keyup (event) ->
		if event.which is 27
			location.href = $('a.cancel').attr('href')
	
	
	$('div.alert-message .close').click (event) ->
		event.preventDefault()
		$(this).closest('.alert-message').slideUp('fast')
		$('#username').focus()
	
