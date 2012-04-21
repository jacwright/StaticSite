(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __slice = Array.prototype.slice;

  define(['./model', 'lib/array-query', 'lib/backbone'], function(Model, query) {
    var Collection;
    return Collection = (function(_super) {

      __extends(Collection, _super);

      Collection.prototype.model = Model;

      Collection.def = Model.def;

      Collection.prop = Model.prop;

      Collection.prop('selected');

      Collection.prop('selectedIndex');

      function Collection(models, options) {
        Collection.__super__.constructor.call(this, models, options);
        this.fields = {
          selected: null,
          selectedIndex: -1
        };
      }

      Collection.prototype.query = function(field) {
        return query.select(this.models).where(field);
      };

      Collection.prototype.trigger = function() {
        var args, event;
        event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        Collection.__super__.trigger.apply(this, [event].concat(__slice.call(args)));
        if (args[args.length - 1] !== 'cloned') {
          if (event === 'change:selected') {
            return this.selectedIndex = this.indexOf(this.selected);
          } else if (event === 'change:selectedIndex') {
            return this.selected = this.at(this.selectedIndex);
          }
        }
      };

      return Collection;

    })(Backbone.Collection);
  });

}).call(this);
