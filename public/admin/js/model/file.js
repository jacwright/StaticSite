(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  define(['./model', './collection', 'lib/promises'], function(Model, Collection, promises) {
    var File, FileCollection, FileType, childSort, escapeRegex, extention, fileName, getExtention, onKeyChange;
    fileName = /([^\/]+)(\/)?$/;
    extention = /\.(\w+)$$/;
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
      if (a.slice(-1) === '/') {
        a = '/' + a;
      }
      b = b.id.toLowerCase();
      if (b.slice(-1) === '/') {
        b = '/' + b;
      }
      if (a < b) {
        return -1;
      } else {
        return 1;
      }
    };
    onKeyChange = function(model, key) {
      var _ref;
      if (!key) {
        return;
      }
      model.name = key.match(fileName)[1];
      return model.url = ((_ref = model.site) != null ? _ref.url : void 0) + key;
    };
    FileType = (function(_super) {

      __extends(FileType, _super);

      FileType.registered = [];

      FileType.attr('name');

      FileType.attr('icon');

      FileType.attr('matches');

      FileType.register = function(fileType) {
        var index;
        if (this.registered[fileType.name] && (index = this.registered.indexOf(this.registered[fileType.name]))) {
          this.registered.splice(index, 1);
        }
        this.registered.push(fileType);
        return this.registered[fileType.name] = fileType;
      };

      FileType.get = function(type) {
        return this.registered[type];
      };

      FileType.matches = function(file) {
        var fileType, i, registered, _i, _ref;
        registered = this.registered;
        for (i = _i = _ref = registered.length; _ref <= 1 ? _i <= 1 : _i >= 1; i = _ref <= 1 ? ++_i : --_i) {
          fileType = registered[i - 1];
          if (fileType.matches(file)) {
            return fileType;
          }
        }
        return console.log('no file type for', file);
      };

      function FileType(attr, opts) {
        FileType.__super__.constructor.call(this, attr, opts);
      }

      return FileType;

    })(Model);
    FileType.register(new FileType({
      name: 'file',
      icon: 'file',
      matches: function() {
        return true;
      }
    }));
    FileType.register(new FileType({
      name: 'folder',
      icon: 'folder',
      matches: function(attr) {
        return attr.key.slice(-1) === '/';
      }
    }));
    File = (function(_super) {

      __extends(File, _super);

      File.subclasses = [];

      File.prototype.idAttribute = 'key';

      File.attr('key');

      File.attr('lastModified');

      File.attr('metadata');

      File.prop('name');

      File.prop('url');

      File.prop('content');

      File.prop('fileType');

      File.def('type', {
        get: function() {
          return this.fileType.name;
        },
        set: function(value) {
          return this.fileType = FileType.registered[value];
        }
      });

      File.def('icon', {
        get: function() {
          return this.fileType.icon;
        }
      });

      function File(attr, opts) {
        var type,
          _this = this;
        type = attr.type;
        delete attr.type;
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
          if (file.parent) {
            file.parent.remove(file);
          }
          return file.parent = _this;
        });
        if (type) {
          this.type = type;
        }
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
        if (this.content === void 0) {
          return;
        }
        return this.site.bucket.put(this.id, this.content, {
          metadata: this.metadata
        });
      };

      File.prototype.fetchMetadata = function(options) {
        var promise, _ref,
          _this = this;
        if (((_ref = app.cache[this.id]) != null ? _ref.lastModified : void 0) === this.lastModified.getTime()) {
          promise = promises.fulfilled(app.cache[this.id]);
        } else {
          promise = app.site.bucket.metadata(this.id);
        }
        return promise.then(function(metadata) {
          _this.metadata = metadata;
          if (!_this.fileType) {
            _this.fileType = FileType.matches(_this);
          }
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
        return FileCollection.__super__.constructor.apply(this, arguments);
      }

      FileCollection.prototype.model = File;

      FileCollection.prototype.comparator = childSort;

      return FileCollection;

    })(Collection);
    File.Collection = FileCollection;
    File.Type = FileType;
    return File;
  });

}).call(this);
