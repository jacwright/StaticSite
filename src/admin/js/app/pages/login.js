var data = require('data'),
	pages = require('pages');

$('#loginform').submit(function(event) {
	event.preventDefault();
	var form = $(this);
	data.login(form.find('input[name=username]').val(), form.find('input[name=password]').val())
		.then(function() {
			pages.go('dashboard');
		}, function() {
			alert('Username or password incorrect');
		});
});

$('#registerform').submit(function(event) {
	event.preventDefault();
	var form = $(this);
	data.register(form.find('input[name=key]').val(),
			form.find('input[name=secret]').val(),
			form.find('input[name=username]').val(),
			form.find('input[name=password]').val())
		.then(function() {
			pages.go('dashboard');
		}, function() {
			alert('Key or secret incorrect');
		});
});
