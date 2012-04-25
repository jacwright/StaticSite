(function() {

  define(['app', 'templates/site-menu-item', 'templates/breadcrumb', 'view/sidebar', 'view/content'], function(app, siteMenuItem, breadcrumb) {
    var getBreadcrumbs, updateCrumbs;
    getBreadcrumbs = function(selected) {
      var crumbs;
      crumbs = [];
      while (selected) {
        crumbs.unshift(selected);
        selected = selected.parent;
      }
      crumbs.unshift(app.sites.selected);
      return crumbs;
    };
    updateCrumbs = function(selectedFile) {
      $('#breadcrumbs > ul > li.crumb').remove();
      return $('#breadcrumbs > ul').append(breadcrumb(getBreadcrumbs(selectedFile)));
    };
    app.sites.on('add', function(site, sites, options) {
      return $('#site-list').children().eq(options.index).before(siteMenuItem(site));
    });
    app.sites.on('change:selected', function(sites, site) {
      document.title = 'Admin | ' + site.name;
      return updateCrumbs();
    });
    app.files.on('change:selected', function(files, file) {
      return updateCrumbs(file);
    });
    return $(function() {
      var siteName;
      $('body').fadeIn();
      $('#signedin-user').text(app.username);
      $('#breadcrumbs').delegate('li.crumb a', 'click', function(event) {
        var fileId;
        event.preventDefault();
        fileId = $(this).attr('href').replace(app.sites.selected.url, '');
        return app.files.selected = app.files.get(fileId);
      });
      $('#site-list').delegate('li', 'click', function(event) {
        var site;
        event.preventDefault();
        site = $(this).data('model');
        if (site) return app.sites.selected = site;
      });
      siteName = location.pathname.split('/')[1];
      if (siteName !== 'websights') {
        return $('#site-name').text(siteName).attr('href', 'http://' + siteName + '/');
      }
    });
  });

}).call(this);
