(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['./file'], function(File) {
    var Folder;
    Folder = (function(_super) {

      __extends(Folder, _super);

      function Folder() {
        Folder.__super__.constructor.apply(this, arguments);
      }

      Folder.prototype.icon = 'folder';

      Folder.prototype.isFolder = true;

      Folder.match = function(attr) {
        return attr.key.slice(-1) === '/';
      };

      return Folder;

    })(File);
    File.subclasses.push(Folder);
    return Folder;
  });

}).call(this);
