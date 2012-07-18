(function() {

  define(['app/auth', 'model/site', 'model/file'], function(auth, Site, File) {
    var app, bucket, site;
    bucket = location.hash.replace(/^#\/([^\/]+).*/, '$1');
    site = new Site({
      name: bucket
    });
    if (!bucket) return;
    app = {
      siteName: location.pathname.split('/')[1],
      username: auth.authorize(),
      site: site,
      files: site.files,
      currentFiles: new File.Collection(),
      load: function() {
        return this.site.fetch().finished(function() {
          if (!app.files.selected) {
            return site.files.trigger('change:selected', site.files);
          }
        });
      },
      registerType: function(page) {}
    };
    app.files.on('change:selected', function(files) {
      var parent;
      parent = files.selected || app.site;
      app.currentFiles.unbecome();
      return app.currentFiles.become(parent.children);
    });
    window.app = app;
    return app;
  });

}).call(this);
