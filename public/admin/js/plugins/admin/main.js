(function() {

  require(['app'], function(app) {
    app.registerType('admin-folder', 'folder-wrench', function(file) {
      return file.key === 'admin/';
    });
    app.registerType('settings', 'page-white-wrench', function(file) {
      return file.key.split('.').pop() === 'json';
    });
    return app.registerType('template-folder', 'folder', function(file) {
      return file.key === 'admin/templates/';
    });
  });

}).call(this);
