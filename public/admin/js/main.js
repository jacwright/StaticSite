(function() {

  require(['app', 'view', 'util/admin-redirect'], function(app) {
    if (!app.username) {
      location.pathname += 'login.html';
      return;
    }
    return app.load();
  });

}).call(this);
