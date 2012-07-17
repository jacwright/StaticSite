(function() {

  define(['app/auth', 'model/site', 'model/file'], function(auth, Site, File) {
    var app;
    app = {
      siteName: location.pathname.split('/')[1],
      username: auth.authorize(),
      sites: new Site.Collection(),
      files: new File.Collection(),
      currentFiles: new File.Collection(),
      load: function() {
        return this.sites.fetch();
      },
      register: function(page) {}
    };
    if (app.siteName === 'websights') app.siteName = null;
    app.sites.on('change:selected', function(sites, site, options) {
      if (options.oldValue) {
        app.files.unbecome();
        app.currentFiles.unbecome();
      }
      if (site) return app.files.become(site.files);
    });
    app.files.on('reset change:selected', function(files) {
      var defaultPage, parent;
      parent = files.selected || app.sites.selected;
      app.currentFiles.unbecome();
      app.currentFiles.become(parent.children);
      if (app.currentFiles.selected === null) {
        defaultPage = app.currentFiles.query('name').is('index.html').end().pop();
        if (!defaultPage) {
          defaultPage = app.currentFiles.query('isFolder').isnt(true).end().shift();
        }
        return app.currentFiles.selected = defaultPage;
      }
    });
    window.app = app;
    return app;
  });

}).call(this);
