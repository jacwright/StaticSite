(function() {
  var __slice = Array.prototype.slice;

  define(['app/auth', 'model/site', 'model/file'], function(auth, Site, File) {
    var app, cloneCollection, proxy, uncloneCollection;
    app = {
      username: auth.authorize(),
      sites: new Site.Collection(),
      files: new File.Collection(),
      children: new File.Collection(),
      load: function() {
        return this.sites.fetch();
      }
    };
    proxy = function() {
      var args, event;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (args[args.length - 1] !== 'cloned') {
        args.push('cloned');
        return this.trigger.apply(this, [event].concat(__slice.call(args)));
      }
    };
    cloneCollection = function(from, to) {
      to.clonedFrom = from;
      to.models = from.models;
      to.length = from.length;
      to._byId = from._byId;
      to._byCid = from._byCid;
      to.on('all', proxy, from);
      from.on('all', proxy, to);
      return to.trigger('reset', to, {});
    };
    uncloneCollection = function(to) {
      var from;
      from = to.clonedFrom;
      to.off('all', proxy, from);
      return from.off('all', proxy, to);
    };
    app.files.on('change:selected', function(files, parent, options) {
      if (parent == null) parent = app.sites.selected;
      uncloneCollection(app.children);
      return cloneCollection(parent.children, app.children);
    });
    app.sites.on('change:selected', function(sites, site, options) {
      if (options.oldValue) {
        uncloneCollection(app.files);
        uncloneCollection(app.children);
      }
      if (site) {
        cloneCollection(site.files, app.files);
        cloneCollection(site.children, app.children);
        if (!site.children.selected) {
          return site.children.selected = site.children.get('index.html');
        }
      }
    });
    window.app = app;
    return app;
  });

}).call(this);
