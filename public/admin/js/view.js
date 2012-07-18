(function() {

  define(['app', 'templates/site-menu-item', 'templates/breadcrumb', 'view/sidebar', 'view/content'], function(app, siteMenuItem, breadcrumb) {
    var getBreadcrumbs, getDefaultFile, updateCrumbs;
    getBreadcrumbs = function(selected) {
      var crumbs;
      crumbs = [];
      while (selected) {
        crumbs.unshift(selected);
        selected = selected.parent;
      }
      crumbs.unshift(app.site);
      return crumbs;
    };
    updateCrumbs = function(selectedFile) {
      $('#breadcrumbs > ul > li.crumb').remove();
      return $('#breadcrumbs > ul').append(breadcrumb(getBreadcrumbs(selectedFile)));
    };
    app.files.on('change:selected', function(files, file) {
      return updateCrumbs(file);
    });
    getDefaultFile = function(folder) {
      var defaultFile;
      defaultFile = folder.children.query('name').is('index.html').end().pop();
      if (!defaultFile) {
        defaultFile = folder.children.query('isFolder').isnt(true).end().shift();
      }
      return defaultFile;
    };
    $(window).on('hashchange', function() {
      var file, oldSelection, url;
      url = location.hash.replace('#/', '');
      file = app.files.query('url').is(url).end().pop();
      if (!file) {
        oldSelection = app.files.selected;
        app.files.selected = null;
        if (!oldSelection) {
          app.site.files.trigger('change:selected', app.site.files);
        }
        return app.currentFiles.selected = getDefaultFile(app.site);
      } else if (file.isFolder) {
        app.files.selected = file;
        return app.currentFiles.selected = getDefaultFile(file);
      } else {
        app.files.selected = file.parent;
        return app.currentFiles.selected = file;
      }
    });
    app.site.on('fetched', function() {
      return $(window).trigger('hashchange');
    });
    return $(function() {
      $('#site-name').text(app.site.name).attr('href', '#/' + app.site.name);
      $('body').fadeIn();
      return $('#signedin-user').text(app.username);
    });
  });

}).call(this);
