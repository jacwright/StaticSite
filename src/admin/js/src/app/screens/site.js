
require('jstree');

var view = $('#pages-screen');

view.find('.sidebar').jstree({
	animation: 0,
	strings: { loading : "Loading ...", new_node : "New page" },
	plugins: []
});


