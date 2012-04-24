(function() {
  var __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', 'lib/array-query', 'lib/backbone'], function(Model, query) {
    var Collection, proxy;
    proxy = function() {
      var args, event;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      return this.trigger.apply(this, [event].concat(__slice.call(args)));
    };
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

      Collection.prototype.become = function(collection) {
        this._became = collection;
        this.models = collection.models;
        this.fields = collection.fields;
        this.length = collection.length;
        this._byId = collection._byId;
        this._byCid = collection._byCid;
        this.add = collection.add.bind(collection);
        this.remove = collection.remove.bind(collection);
        collection.on('all', proxy, this);
        return this.trigger('reset', this, {});
      };

      Collection.prototype.unbecome = function() {
        var collection;
        collection = this._became;
        if (collection) {
          delete this.add;
          delete this.remove;
          return collection.off('all', proxy, this);
        }
      };

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
