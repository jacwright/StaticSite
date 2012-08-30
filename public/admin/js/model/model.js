(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define(['lib/promises', 'lib/backbone'], function(promises) {
    var Model, reservedAttrs;
    reservedAttrs = {
      id: true,
      _changed: true,
      _setting: true,
      _moreChanges: true
    };
    Model = (function(_super) {

      __extends(Model, _super);

      function Model(attributes, options) {
        Model.__super__.constructor.call(this, attributes, options);
        this.fields = {};
      }

      Model.def = function(property, definition) {
        return Object.defineProperty(this.prototype, property, definition);
      };

      Model.attr = function(property, defaultValue) {
        if (reservedAttrs[property]) {
          throw new Error("'" + property + "' is a reserved name and cannot be declared as a Backbone attribute");
        }
        if (arguments.length > 1) {
          if (!this.prototype.defaults) {
            this.prototype.defaults = {};
          }
          this.prototype.defaults[property] = defaultValue;
        }
        return this.def(property, {
          get: function() {
            return this.attributes[property];
          },
          set: function(value) {
            var changes;
            if (value === this.attributes[property]) {
              return;
            }
            changes = {};
            changes[property] = value;
            return this.set(changes);
          }
        });
      };

      Model.prop = function(property) {
        return this.def(property, {
          get: function() {
            return this.fields[property];
          },
          set: function(value) {
            var oldValue;
            if (value == null) {
              value = null;
            }
            oldValue = this.fields[property];
            if (value === oldValue) {
              return;
            }
            this.fields[property] = value;
            this.trigger('change:' + property, this, value, {
              oldValue: oldValue
            });
            return this.trigger('change', this, {});
          }
        });
      };

      return Model;

    })(Backbone.Model);
    promises.Promise.prototype.make = function(ModelClass) {
      return this.then(function() {
        var args, i, item, _i, _len, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        args.isArgs = true;
        if (args[0] instanceof Array) {
          _ref = args[0];
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            item = _ref[i];
            args[0][i] = new ModelClass(item);
          }
        } else {
          args[0] = new ModelClass(args[0]);
        }
        return args;
      });
    };
    return Model;
  });

}).call(this);
