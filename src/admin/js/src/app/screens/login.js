var data = require('data'),
	screens = require('screens'),
	cookie = require('cookie');


screens.bind('open:login', function() {
	$('#login :text:visible:first').focus();
	$('#login :checkbox[name=rememberme]').attr('checked', !!cookie.get('rememberme'));
	data.auth().then(function() {
		screens.go('dashboard');
	});
});


// login
$('#loginform').submit(function(event) {
	event.preventDefault();
	var form = $(this);
	var username = form.find('input[name=username]').val();
	var password = form.find('input[name=password]').val();
	var rememberme = form.find('input[name=rememberme]').attr('checked');
	
	data.login(username, password, rememberme).then(function() {
		$('#login :text, #login :password').val('');
		$('#login :checkbox').attr('checked', false);
		screens.go('dashboard');
	}, function() {
		alert('Username or password incorrect');
	});
});


// register
$('#registerform').submit(function(event) {
	event.preventDefault();
	var form = $(this);
	data.register(form.find('input[name=key]').val(),
			form.find('input[name=secret]').val(),
			form.find('input[name=username]').val(),
			form.find('input[name=password]').val())
		.then(function() {
			$('#login :text, #login :password').val('');
			$('#login :checkbox').attr('checked', false);
			screens.go('dashboard');
		}, function() {
			alert('Key or secret incorrect');
		});
});
