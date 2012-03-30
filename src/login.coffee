
require ['app/auth', 'util/admin-redirect'], (auth) ->
	
	# view code
	$ ->
		$('body').fadeIn()
		$('div.alert-message').hide()
	
		$('.cancel').click (event) ->
			event.preventDefault()
			history.back()
		
		
		$('#username').focus()
		
		$('#loginform').submit (event) ->
			event.preventDefault()
			$('#alerts').slideUp('fast')
			
			# process sign-in
			username = $('#username').val()
			password = $('#password').val()
			rememberme = $('#rememberme').prop('checked')
			
			auth.login(username, password, rememberme).then ->
				location.href = './'
			, (err) ->
				console.log(err)
				$('#alerts').slideDown('fast').find('.msg').text(err.message)
			
		
		
		$('div.alert-message .close').click (event) ->
			event.preventDefault()
			$(this).closest('.alert-message').slideUp('fast')
			$('#username').focus()
		
		
		$('a.forgot-password').click (event) ->
			event.preventDefault()
			$('#forgot').toggle('fast')
			$('#username').focus()

