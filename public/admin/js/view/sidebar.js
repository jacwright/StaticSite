(function() {

  require(['app', 'templates/menu-item', 'templates/new-file'], function(app, menuItem, newFile) {
    var onFileAdd, onSelectedFileChange, onSelectedSiteChange, site;
    site = null;
    onSelectedSiteChange = function(sites, selectedSite) {
      if (site != null) site.files.off('change:selected', onSelectedFileChange);
      site = selectedSite;
      site.files.on('change:selected', onSelectedFileChange);
      onSelectedFileChange(site, site.files.selected);
      $('#menu ul li').remove();
      site.children.on('add', onFileAdd);
      return site.children.forEach(function(file, index) {
        return onFileAdd(file, site.children, {
          index: index
        });
      });
    };
    onSelectedFileChange = function(site, selectedFile) {};
    onFileAdd = function(file, files, options) {
      var nextFile;
      nextFile = $('#menu ul').children().eq(options.index);
      if (nextFile.length) {
        return nextFile.before(menuItem(file));
      } else {
        return $('#menu ul').append(menuItem(file));
      }
    };
    app.sites.on('change:selected', onSelectedSiteChange);
    if (app.sites.selected) onSelectedSiteChange(app.sites, app.sites.selected);
    return $(function() {
      $('#new-file').click(function() {
        return newFile().modal({
          backdrop: 'static'
        });
      });
      return $('#menu').delegate('li', 'click', function() {
        $(this).siblings('.active').removeClass('active');
        return $(this).toggleClass('active');
      });
    });
  });

}).call(this);
