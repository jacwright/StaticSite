(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', './collection', 'lib/promises'], function(Model, Collection, promises) {
    var File, FileCollection, childSort, escapeRegex, extention, fileName, getExtention, icons, onKeyChange;
    fileName = /([^\/]+)(\/)?$/;
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
    escapeRegex = function(text) {
      return text.replace(/([\\\*\+\?\|\{\[\(\)\^\$\.\#])/g, '\\$1');
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

      File.attr('key');

      File.attr('lastModified');

      File.prop('name');

      File.prop('url');

      File.prop('content');

      function File(attr, opts) {
        var subclass,
          _this = this;
        if (this.constructor === File) {
          subclass = File.subclasses.filter(function(subclass) {
            return subclass.match(attr);
          }).pop();
          if (subclass) return new subclass(attr, opts);
        }
        if ((attr != null ? attr.lastModified : void 0) != null) {
          attr.lastModified = new Date(attr.lastModified);
        }
        File.__super__.constructor.call(this, attr, opts);
        this.on('change:key', onKeyChange);
        if (attr != null ? attr.key : void 0) {
          this.trigger('change:key', this, this.id);
        }
        this.children = new FileCollection();
        this.children.on('remove', function(file) {
          return file.parent = null;
        });
        this.children.on('add', function(file) {
          if (file.parent) file.parent.remove(file);
          return file.parent = _this;
        });
      }

      File.prototype.keyFromName = function(name) {
        return this.id.replace(fileName, name + '$2');
      };

      File.prototype.copy = function(newKey) {
        var oldKey, operations,
          _this = this;
        oldKey = new RegExp('^' + escapeRegex(this.id));
        operations = this.children.map(function(file) {
          return file.copy(file.id.replace(oldKey, newKey));
        });
        operations.push(this.site.bucket.copy(this.id, newKey));
        return promises.whenAll(operations).then(function() {
          return _this;
        });
      };

      File.prototype.destroy = function(options) {
        var operations,
          _this = this;
        operations = this.children.map(function(file) {
          return file.destroy();
        });
        operations.push(this.site.bucket.destroy(this.id));
        this.trigger('destroy', this, this.collection, options);
        return promises.whenAll(operations).then(function() {
          return _this;
        });
      };

      File.prototype.rename = function(newKey) {
        var getKeys, keysToDelete,
          _this = this;
        getKeys = function(file) {
          var keys;
          keys = [];
          file.children.forEach(function(file) {
            return keys = keys.concat(getKeys(file));
          });
          keys.push(file.id);
          return keys;
        };
        keysToDelete = getKeys(this);
        this.copy(newKey).then(function() {
          var operations;
          operations = keysToDelete.map(function(key) {
            return _this.site.bucket.destroy(key);
          });
          return promises.whenAll(operations).then(function() {
            return _this;
          });
        });
        return this.set('key', newKey);
      };

      File.prototype.save = function(options) {
        if (this.content === void 0) return;
        return this.site.bucket.put(this.id, this.content);
      };

      File.prototype.fetchMetadata = function(options) {
        var promise, _ref,
          _this = this;
        if (((_ref = app.cache[this.id]) != null ? _ref.lastModified : void 0) === this.lastModified.getTime()) {
          delete app.cache[this.id].lastModified;
          promise = promises.fulfilled(app.cache[this.id]);
        } else {
          promise = app.site.bucket.metadata(this.id);
        }
        return promise.then(function(metadata) {
          var name, value;
          for (name in metadata) {
            value = metadata[name];
            _this[name] = value;
          }
          metadata.lastModified = _this.lastModified.getTime();
          app.cache[_this.id] = metadata;
          return _this;
        });
      };

      File.prototype.fetch = function(options) {
        var _this = this;
        return this.site.bucket.get(this.id).then(function(content) {
          _this.content = content;
          return _this;
        });
      };

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
          File.subclasses.forEach(function(subclass) {
            if (subclass.match(attrs)) return modelClass = subclass;
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
