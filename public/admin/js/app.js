(function() {

  define(['app/auth', 'model/site', 'model/file'], function(auth, Site, File) {
    var app, site;
    site = new Site({
      name: auth.siteName
    });
    app = {
      siteName: auth.siteName,
      username: auth.authorize(),
      site: site,
      files: site.files,
      currentFiles: new File.Collection(),
      cache: JSON.parse(localStorage.getItem('appcache') || '{}'),
      load: function() {
        var _this = this;
        return require(['plugins/admin/main', 'plugins/codeable/main', 'plugins/images/main'], function() {
          return _this.site.fetch().finished(function() {
            if (!app.files.selected) {
              site.files.trigger('change:selected', site.files);
            }
            return localStorage.setItem('appcache', JSON.stringify(app.cache));
          });
        });
      },
      registerType: function(name, icon, matches) {
        return File.Type.register(new File.Type({
          name: name,
          icon: icon,
          matches: matches
        }));
      }
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
