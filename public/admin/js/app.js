(function() {

  define(['app/auth', 'model/site'], function(auth, Site) {
    return {
      username: auth.authorize(),
      sites: new Site.Collection(),
      load: function() {
        return this.sites.fetch();
      }
    };
  });

}).call(this);
