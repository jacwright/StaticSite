(function() {

  define(['app', 'view/sidebar'], function(app) {
    app.sites.on('add', function(site, sites, options) {
      return $('#site-list').children().eq(options.index).before('<li><a href="#"><span class="icon sitemap"></span> ' + site.name + '</a></li>');
    });
    app.sites.on('change:selected', function(sites, site) {
      $('#selected-site').text(site.name);
      return document.title = 'Admin | ' + site.name;
    });
    return $(function() {
      return $('body').fadeIn();
    });
  });

}).call(this);
