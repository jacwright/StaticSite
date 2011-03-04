// combined version of the admin code

$('body.login a.forgot-password').click(function(event) {
	event.preventDefault();
	alert('We cannot retrieve passwords. You may re-register with the same username.');
});

$('body.login a.register-new, body.login a.sign-in').click(function(event) {
	event.preventDefault();
	$('body').toggleClass('register');
});