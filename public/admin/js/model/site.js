(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./model', './collection', './file', 'lib/s3', './folder', './page', './admin-files'], function(Model, Collection, File, s3) {
    var Site, SiteCollection, fileName, trailingSlash;
    trailingSlash = /\/$/;
    fileName = /[^\/]+\/?$/;
    Site = (function(_super) {

      __extends(Site, _super);

      Site.prototype.idAttribute = 'name';

      Site.attr('name');

      Site.attr('creationDate');

      Site.prop('url');

      Site.prototype.icon = 'sitemap';

      function Site(attr, opts) {
        var _this = this;
        if (attr != null) attr.creationDate = new Date(attr.creationDate);
        Site.__super__.constructor.call(this, attr, opts);
        this.url = "" + this.name + "/";
        this.bucket = s3.bucket(this.name);
        this._lookup = {};
        this.files = new File.Collection([], {
          comparator: function(file) {
            return file.id.toLowerCase();
          }
        });
        this.children = new File.Collection();
        this.files.on('add', function(file, files) {
          var parent, parentId;
          file.site = _this;
          file.url = _this.url + file.id;
          parentId = file.id.replace(fileName, '');
          _this._lookup[file.id] = file;
          parent = _this._lookup[parentId] || _this._lookup[parentId.replace(trailingSlash, '')];
          if (parent) {
            return parent.children.add(file);
          } else {
            return _this.children.add(file);
          }
        });
      }

      Site.prototype.fetch = function(options) {
        var _this = this;
        return this.bucket.list().then(function(files) {
          _this.files.add(files);
          _this.trigger('fetched', _this);
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
