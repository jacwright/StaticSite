(function() {

  require(['app'], function(app) {
    return app.registerType('image', 'picture', function(file) {
      return file.metadata.contentType.indexOf('image/') === 0;
    });
  });

}).call(this);
