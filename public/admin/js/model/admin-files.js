(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define(['./file', './folder', 'lib/promises'], function(File, Folder, promises) {
    var AdminFolder, HiddenFiles, SettingsFile, TemplatesFolder, settingsCID;
    settingsCID = null;
    AdminFolder = (function(_super) {

      __extends(AdminFolder, _super);

      AdminFolder.prototype.icon = 'folder-wrench';

      AdminFolder.prop('site');

      function AdminFolder() {
        var args, settings,
          _this = this;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        AdminFolder.__super__.constructor.apply(this, args);
        settings = new SettingsFile;
        this.children.add(settings);
        this.on('change:site', function() {
          return settings.site = _this.site;
        });
      }

      AdminFolder.match = function(attr) {
        return attr.key === 'admin/';
      };

      return AdminFolder;

    })(Folder);
    SettingsFile = (function(_super) {

      __extends(SettingsFile, _super);

      SettingsFile.prototype.icon = 'page-white-wrench';

      SettingsFile.prototype.nonStandard = true;

      function SettingsFile(attr, opts) {
        if (attr == null) {
          attr = {};
        }
        attr.key = 'admin/settings';
        SettingsFile.__super__.constructor.call(this, attr, opts);
        settingsCID = this.cid;
        this.content = 'Settings page here';
      }

      SettingsFile.prototype.fetch = function() {
        var deferred;
        deferred = new promises.Deferred;
        deferred.fulfill(this);
        return deferred.promise;
      };

      return SettingsFile;

    })(File);
    TemplatesFolder = (function(_super) {

      __extends(TemplatesFolder, _super);

      function TemplatesFolder() {
        return TemplatesFolder.__super__.constructor.apply(this, arguments);
      }

      TemplatesFolder.prototype.nonStandard = true;

      TemplatesFolder.match = function(attr) {
        return attr.key === 'admin/templates/';
      };

      return TemplatesFolder;

    })(Folder);
    HiddenFiles = (function(_super) {

      __extends(HiddenFiles, _super);

      function HiddenFiles(attr, opts) {
        HiddenFiles.__super__.constructor.call(this, attr, opts);
        this.cid = settingsCID;
      }

      HiddenFiles.match = function(attr) {
        return attr.key.indexOf('admin/') === 0 && attr.key.indexOf('admin/templates') !== 0;
      };

      return HiddenFiles;

    })(File);
    File.subclasses.push(HiddenFiles);
    File.subclasses.push(AdminFolder);
    File.subclasses.push(TemplatesFolder);
    return AdminFolder;
  });

}).call(this);
