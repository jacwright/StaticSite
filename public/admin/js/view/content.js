(function() {

  require(['app'], function(app) {
    return app.children.on('change:selected', function(site, file) {
      if (!file) return;
      file.fetch();
      $('#code-editor').hide();
      if (file) return $('#frame').prop('src', file.url);
    });
  });

}).call(this);
