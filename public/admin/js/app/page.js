(function() {
  var Collection, Model, Page, Pages, exports, query,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  query = require('../lib/query');

  Model = require('Backbone').Model;

  Collection = require('Backbone').Collection;

  Page = (function(_super) {

    __extends(Page, _super);

    function Page() {
      Page.__super__.constructor.apply(this, arguments);
    }

    return Page;

  })(Model);

  module.exports = exports = Page;

  Pages = (function(_super) {

    __extends(Pages, _super);

    function Pages() {
      Pages.__super__.constructor.apply(this, arguments);
    }

    Pages.prototype.model = Page;

    Pages.prototype.getByPath = function(path) {
      return query('path').is(path).on(this.models);
    };

    Pages.prototype.getChildrenOf = function(path) {
      return query('path').startsWith(path).on(this.models);
    };

    Pages.prototype.getParentsOf = function(path) {
      var parts, paths;
      paths = [];
      parts = path.replace(/\/$/, '').split('/');
      parts.pop();
      while (parts.length) {
        paths.push(parts.join('/'));
        parts.pop();
      }
      return query('path').within(paths).on(this.models);
    };

    return Pages;

  })(Collection);

  alert(Pages);

  exports.Pages = Pages;

  exports.collection = new Pages();

}).call(this);
