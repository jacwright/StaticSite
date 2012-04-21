(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', './collection'], function(Model, Collection) {
    var File, FileCollection, childSort, extention, fileName, getExtention, icons, onKeyChange;
    fileName = /([^\/]+)\/?$/;
    extention = /\.(\w+)$$/;
    icons = {
      js: 'script',
      html: 'html',
      css: 'css'
    };
    getExtention = function(key) {
      var match;
      match = key.match(extention);
      return (match != null ? match[1] : void 0) || '';
    };
    childSort = function(a, b) {
      a = a.id.toLowerCase();
      if (a.slice(-1) === '/') a = '/' + a;
      b = b.id.toLowerCase();
      if (b.slice(-1) === '/') b = '/' + b;
      if (a < b) {
        return -1;
      } else {
        return 1;
      }
    };
    onKeyChange = function(model, key) {
      var ext, _ref;
      if (!key) return;
      model.name = key.match(fileName)[1];
      model.url = ((_ref = model.site) != null ? _ref.url : void 0) + key;
      ext = getExtention(key);
      if (icons.hasOwnProperty(ext)) {
        return model.icon = icons[ext];
      } else {
        return delete model.icon;
      }
    };
    File = (function(_super) {

      __extends(File, _super);

      File.subclasses = [];

      File.prototype.idAttribute = 'key';

      File.prototype.icon = 'page';

      File.attr('lastModified');

      File.prop('name');

      File.prop('url');

      function File(attr, opts) {
        var _this = this;
        if (attr != null) attr.lastModified = new Date(attr.lastModified);
        File.__super__.constructor.call(this, attr, opts);
        this.on('change:key', onKeyChange);
        if (attr.key) this.trigger('change:key', this, this.id);
        this.children = new FileCollection();
        this.children.on('remove', function(file) {
          return file.parent = null;
        });
        this.children.on('add', function(file) {
          if (file.parent) file.parent.remove(file);
          return file.parent = _this;
        });
      }

      return File;

    })(Model);
    FileCollection = (function(_super) {

      __extends(FileCollection, _super);

      function FileCollection() {
        FileCollection.__super__.constructor.apply(this, arguments);
      }

      FileCollection.prototype.model = File;

      FileCollection.prototype.comparator = childSort;

      FileCollection.prototype._prepareModel = function(model, options) {
        var attrs, modelClass;
        if (options == null) options = {};
        if (!(model instanceof Model)) {
          modelClass = this.model;
          attrs = model;
          options.collection = this;
          File.subclasses.some(function(subclass) {
            if (subclass.match(attrs)) {
              modelClass = subclass;
              return true;
            } else {
              return false;
            }
          });
          model = new modelClass(attrs, options);
        }
        return FileCollection.__super__._prepareModel.call(this, model, options);
      };

      return FileCollection;

    })(Collection);
    File.Collection = FileCollection;
    return File;
  });

}).call(this);
