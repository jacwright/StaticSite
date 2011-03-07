var data = require('data'),
	screens = require('screens');

screens.bind('open:logout', function() {
	data.logout();
	screens.go('login');
});
