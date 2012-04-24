(function() {

  define(['app/auth', 'model/site', 'model/file'], function(auth, Site, File) {
    var app;
    app = {
      username: auth.authorize(),
      sites: new Site.Collection(),
      files: new File.Collection(),
      children: new File.Collection(),
      load: function() {
        return this.sites.fetch();
      }
    };
    app.sites.on('change:selected', function(sites, site, options) {
      if (options.oldValue) {
        app.files.unbecome();
        app.children.unbecome();
      }
      if (site) return app.files.become(site.files);
    });
    app.files.on('reset change:selected', function(files) {
      var indexPage, parent;
      parent = files.selected || app.sites.selected;
      app.children.unbecome();
      app.children.become(parent.children);
      indexPage = app.children.query('name').is('index.html').end().pop();
      if (app.children.selected === null && indexPage) {
        return app.children.selected = indexPage;
      }
    });
    window.app = app;
    return app;
  });

}).call(this);
