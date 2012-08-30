(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  define(['./file'], function(File) {
    var Folder;
    Folder = (function(_super) {

      __extends(Folder, _super);

      Folder.prototype.icon = 'folder';

      Folder.prototype.isFolder = true;

      function Folder() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        Folder.__super__.constructor.apply(this, args);
        this.content = '';
      }

      Folder.match = function(attr) {
        return attr.key.slice(-1) === '/';
      };

      return Folder;

    })(File);
    File.subclasses.push(Folder);
    return Folder;
  });

}).call(this);
