
require ['app/auth', 'util/admin-redirect'], (auth) ->
	
	# view code
	$ ->
		$('body').fadeIn()
		$('div.alert').hide()
		$('a.cancel').attr('href', $('a.cancel').attr('href') + location.hash);
		
		$('#key').focus()
		
		$('#registerform').submit (event) ->
			event.preventDefault()
			$('#alerts').slideUp('fast')
			
			# process sign-in
			key = $('#key').val()
			secret = $('#secret').val()
			username = $('#username').val()
			password = $('#password').val()
			rememberme = $('#rememberme').prop('checked')
			
			auth.register(key, secret, username, password, rememberme).then ->
				auth.login(username, password, rememberme).then ->
					location.pathname = location.pathname.replace(/[^\/]+$/, '')
				, (err) ->
					console.log(err)
					$('#alerts').slideDown('fast').find('.msg').text(err.message)
			, (err) ->
				console.log(err)
				$('#alerts').slideDown('fast').find('.msg').text(err.message)
		
		
		$('div.alert .close').click (event) ->
			event.preventDefault()
			$(this).closest('.alert').slideUp('fast')
			$('#key').focus()
		
		
		# cancel by esc
		$('#registerform').keyup (event) ->
			if event.which is 27
				location.href = $('a.cancel').attr('href')
		
