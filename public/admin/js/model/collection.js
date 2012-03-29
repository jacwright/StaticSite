(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', 'lib/backbone'], function(Model) {
    var Collection;
    return Collection = (function(_super) {

      __extends(Collection, _super);

      Collection.prototype.model = Model;

      Collection.def = Model.def;

      Collection.prop = Model.prop;

      Collection.prop('selected');

      Collection.prop('selectedIndex');

      function Collection(models, options) {
        if (options != null ? options.model : void 0) this.model = options.model;
        Collection.__super__.constructor.call(this, models, options);
        this.fields = {
          selected: null,
          selectedIndex: -1
        };
        this.bind('change:selected', function(collection, selected) {
          return this.selectedIndex = this.indexOf(selected);
        });
        this.bind('change:selectedIndex', function(collection, index) {
          return this.selected = this.at(index);
        });
      }

      return Collection;

    })(Backbone.Collection);
  });

}).call(this);
