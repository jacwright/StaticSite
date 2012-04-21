(function() {

  require(['app', 'templates/menu-item', 'templates/new-file'], function(app, menuItem, newFile) {
    var onFileAdd;
    onFileAdd = function(file, files, options) {
      var nextFile;
      nextFile = $('#menu ul').children().eq(options.index);
      if (nextFile.length) {
        return nextFile.before(menuItem(file));
      } else {
        return $('#menu ul').append(menuItem(file));
      }
    };
    app.children.on('add', onFileAdd);
    app.children.on('change:selectedIndex', function(site, index) {
      $('#menu ul li.active').removeClass('active');
      return $('#menu ul li').eq(index).addClass('active');
    });
    app.children.on('change:selected', function(site, file) {
      return $('#frame').prop('src', file.url);
    });
    app.children.on('reset', function() {
      $('#menu ul li').remove();
      return app.children.forEach(function(file, index) {
        return onFileAdd(file, app.children, {
          index: index
        });
      });
    });
    return $(function() {
      $('#new-file').click(function() {
        return newFile().modal({
          backdrop: 'static'
        });
      });
      $('#menu').delegate('li', 'click', function() {
        return app.children.selected = app.children.get($(this).data('id'));
      });
      return $('#menu').delegate('li', 'dblclick', function(event) {
        var file;
        file = $(this).data('model');
        if (file.isFolder) {
          return app.files.selected = app.children.get($(this).data('id'));
        }
      });
    });
  });

}).call(this);
