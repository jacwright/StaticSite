(function() {

  require(['app'], function(app) {
    app.registerType('html', 'html', function(file) {
      return file.metadata.contentType === 'text/html' && file.key !== 'admin/';
    });
    app.registerType('css', 'css', function(file) {
      return file.metadata.contentType === 'text/css';
    });
    return app.registerType('javascript', 'script', function(file) {
      return file.metadata.contentType === 'application/javascript';
    });
  });

}).call(this);
