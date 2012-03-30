(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./file'], function(File) {
    var Page;
    Page = (function(_super) {

      __extends(Page, _super);

      function Page() {
        Page.__super__.constructor.apply(this, arguments);
      }

      Page.prototype.icon = 'layout';

      Page.prototype.descendents = function() {
        var path;
        path = this.id + '/';
        return this.collection.query('id').startsWith(path).end();
      };

      Page.prototype.anscestors = function(id) {
        var ids, parts;
        ids = [];
        parts = id.replace(/\/$/, '').split('/');
        parts.pop();
        while (parts.length) {
          ids.push(parts.join('/'));
          parts.pop();
        }
        return query('id').within(ids).on(this.models);
      };

      return Page;

    })(File);
    return Page;
  });

}).call(this);
