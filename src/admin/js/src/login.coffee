data = require('./app/data')



# view code
$ ->
	$('div.alert-message').hide()

	siteurl = "http://#{location.pathname.split('/')[1]}/"
	$('a.siteurl').attr('href', siteurl);
	
	
	$('#username').focus()
	
	$('#loginform').submit (event) ->
		event.preventDefault()
		$('#alerts').slideUp('fast')
		
		# process sign-in
		username = $('#username').val()
		password = $('#password').val()
		rememberme = $('#rememberme').attr('checked')
		
		data.login(username, password, rememberme).then ->
			location.href = './'
		, (err) ->
			$('#alerts').slideDown('fast').find('.msg').text(err.message)
		
	
	
	$('div.alert-message .close').click (event) ->
		event.preventDefault()
		$(this).closest('.alert-message').slideUp('fast')
		$('#username').focus()
	
	
	$('a.forgot-password').click (event) ->
		event.preventDefault()
		$('#forgot').toggle('fast')
		$('#username').focus()
