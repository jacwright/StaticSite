(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', './collection', './file', 'lib/s3', 'lib/promises'], function(Model, Collection, File, s3, promises) {
    var Site, SiteCollection, createFileHierarchy, fileName, trailingSlash;
    trailingSlash = /\/$/;
    fileName = /[^\/]+\/?$/;
    createFileHierarchy = function(files, children) {
      var lookup;
      lookup = {};
      return files.forEach(function(file) {
        var parent, parentId;
        parentId = file.id.replace(fileName, '');
        lookup[file.id] = file;
        parent = lookup[parentId] || lookup[parentId.replace(trailingSlash, '')];
        if (parent) {
          return parent.children.add(file);
        } else if (file.id !== 'admin/') {
          return children.add(file);
        }
      });
    };
    Site = (function(_super) {

      __extends(Site, _super);

      Site.attr('name');

      Site.attr('creationDate');

      function Site(attr, opts) {
        if (attr != null) attr.creationDate = new Date(attr.creationDate);
        Site.__super__.constructor.call(this, attr, opts);
        this.bucket = s3.bucket(this.name);
        this.files = new File.Collection(this.get('files'), {
          comparator: function(file) {
            return file.id.toLowerCase();
          }
        });
        this.children = new File.Collection();
      }

      Site.prototype.fetch = function(options) {
        var _this = this;
        return this.bucket.list().then(function(files) {
          _this.files.add(files);
          createFileHierarchy(_this.files, _this.children);
          return _this;
        });
      };

      return Site;

    })(Model);
    SiteCollection = (function(_super) {

      __extends(SiteCollection, _super);

      function SiteCollection() {
        SiteCollection.__super__.constructor.apply(this, arguments);
      }

      SiteCollection.prototype.model = Site;

      SiteCollection.prototype.comparator = function(a, b) {
        return a.creationDate.getTime() < b.creationDate.getTime();
      };

      SiteCollection.prototype.fetch = function(options) {
        var _this = this;
        return s3.list().get('buckets').make(Site).when('fetch').finished(function(sites) {
          sites = sites.filter(function(site) {
            return site instanceof Site;
          });
          _this.add(sites);
          return _this;
        });
      };

      return SiteCollection;

    })(Collection);
    Site.Collection = SiteCollection;
    return Site;
  });

}).call(this);
