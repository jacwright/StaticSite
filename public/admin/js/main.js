(function() {

  require(['app', 'view', 'util/admin-redirect'], function(app) {
    if (!app.username) {
      location.pathname += 'login.html';
      return;
    }
    return app.load().finished(function(sites) {
      var atSite;
      atSite = sites.get(app.siteName);
      if (atSite) {
        return sites.selected = atSite;
      } else {
        return sites.selectedIndex = 0;
      }
    });
  });

}).call(this);
