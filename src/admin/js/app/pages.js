var Class = require('class').Class,
	View = require('backbone').View,
	Backbone = require('backbone');


var Pages = exports.Pages = new Class({
	extend: View,
	
	templateName: '{name}.html',
	
	constructor: function(element, pages) {
		this.el = $(element);
		this.$('> *').hide();
		this.pages = {};
		if (pages) {
			for (var name in pages) {
				if (!pages.hasOwnProperty(name)) continue;
				this.pages[name] = $(pages[name]);
			}
		}
	},
	
	/**
	 * Open a page by the given name, if not loaded yet will load first
	 * @param name The page name
	 * @param data Data to pass into the "show" event of the page
	 * @return This object
	 */
	open: function(name, data) {
		var basePage = name.split('/').shift();
		
		if (!this.pages.hasOwnProperty(basePage)) {
			var self = this;
			this.load(basePage).then(function() {
				self._open(name, data);
			});
		} else {
			this._open(name, data);
		}
		return this;
	},
	
	/**
	 * Loads a page by name
	 * @param name
	 */
	load: function(name) {
		var url = this.templateName.replace(/\{\s*name\s*\}/g, name), self = this;
		var page = $('<div class="page loading"></div>').appendTo(this.el);
		self.pages[name] = page;
		self.trigger('created:' + name, page);
		self.trigger('created', name, page);
		
		return $.get(url).then(function(result) {
			var bod = result.indexOf('<body');
			if (bod !== -1) {
				var bodStart = result.indexOf('>', bod) + 1;
				var bodEnd = result.lastIndexOf('</body>');
				result = result.slice(bodStart, bodEnd);
			}
			result = result.replace(/<script.+?<\/script>/g, '');
			page.html(result).removeClass('loading').hide().find('.pages > :not(:first-child)').hide();
			self.trigger('load', name, page);
			require('pages/' + name);
			return page;
		});
	},
	
	_open: function(name, data) {
		var pages = name.split('/');
		var basePage = pages.shift(), subPage = pages.shift();
		var page = this.pages[basePage], sub = subPage ? page.find('.pages > .' + subPage) : page.find('.pages > :first');
		var baseOpened = false;
		
		if (!page.filter(':visible').length) {
			page.show().trigger('show', [data]);
			this.trigger('open', basePage, page);
			baseOpened = true;
		}
		
		if (sub.length && (baseOpened || !sub.filter(':visible').length)) {
			if (!sub.filter(':visible').length) {
				sub.siblings(':visible').hide();
				sub.show();
			}
			this.trigger('open', name, sub);
		}
	}
});



var pages = exports.pages = new Pages('#pages');
pages.bind('open', function(name) {
	$('body').attr('class', name.split('/').shift());
});



var history = Backbone.history = new Backbone.History();
history.route(/.*/, function(page) {
	if (page.slice(0, 1) === '/') pages.open(page.slice(1));
});
history.start();