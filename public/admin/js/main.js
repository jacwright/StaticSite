(function() {

  require(['app', 'view'], function(app) {
    var path;
    if (location.protocol !== 'https:' || location.host !== 's3.amazonaws.com') {
      path = 'websights' + location.pathname.replace(/^\/websights/, '');
      if (location.host !== 's3.amazonaws.com') path += '#' + location.host;
      location.href = "https://s3.amazonaws.com/" + path;
      throw new Error('Cannot administer site from this location.');
    }
    if (!app.username) {
      location.pathname = '/websights/admin/login.html';
      return;
    }
    return app.load().finished(function(sites) {
      return sites.selectedIndex = 0;
    });
  });

}).call(this);
