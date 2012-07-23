
require ['app/auth', 'util/admin-redirect'], (auth) ->
	
	# view code
	$ ->
		$('body').fadeIn()
		$('div.alert').hide()
		$('a.register-new').attr('href', $('a.register-new').attr('href') + location.hash);
		
		$('a.cancel').attr('href', 'http://' + auth.siteName + '/');
		$('#site-name').text(auth.siteName);
		
		
		$('#username').focus()
		
		$('#loginform').submit (event) ->
			event.preventDefault()
			$('#alerts').slideUp('fast')
			
			# process sign-in
			username = $('#username').val()
			password = $('#password').val()
			rememberme = $('#rememberme').prop('checked')
			
			auth.login(username, password, rememberme).then ->
				location.pathname = location.pathname.replace(/[^\/]+$/, '')
			, (err) ->
				console.log(err)
				$('#alerts').slideDown('fast').find('.msg').text(err.message)
			
		
		$('div.alert .close').click (event) ->
			event.preventDefault()
			$(this).closest('.alert').slideUp('fast')
			$('#username').focus()
		
		$('a.forgot-password').click (event) ->
			event.preventDefault()
			$('#forgot').toggle('fast')
			$('#username').focus()

