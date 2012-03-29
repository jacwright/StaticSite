(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', './collection'], function(Model, Collection) {
    var File, FileCollection, childSort, fileName;
    fileName = /[^\/]+\/?$/;
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
    File = (function(_super) {

      __extends(File, _super);

      File.prototype.idAttribute = 'key';

      File.attr('lastModified');

      File.prop('name');

      function File(attr, opts) {
        var _this = this;
        if (attr != null) attr.lastModified = new Date(attr.lastModified);
        File.__super__.constructor.call(this, attr, opts);
        this.on('change:key', function() {
          if (!_this.key) return;
          _this.name = _this.key.match(fileName)[0];
          return _this.isFolder = _this.id.slice(-1) === '/';
        });
        if (attr.key) this.trigger('change:key');
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

      return FileCollection;

    })(Collection);
    File.Collection = FileCollection;
    return File;
  });

}).call(this);
