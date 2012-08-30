(function() {

  require(['app', 'model/file', 'templates/menu-item', 'templates/new-file'], function(app, File, menuItem, newFile) {
    var editName, onFileAdd;
    onFileAdd = function(file, files, options) {
      var nextFile;
      nextFile = $('#menu > ul').children().eq(options.index);
      if (nextFile.length) {
        return menuItem(file).insertBefore(nextFile);
      } else {
        return menuItem(file).appendTo('#menu > ul');
      }
    };
    app.currentFiles.on('add', onFileAdd);
    app.currentFiles.on('remove', function(file, files, options) {
      return $("#menu li[data-id=" + file.cid + "]").remove();
    });
    app.currentFiles.on('reset', function() {
      $('#menu ul li').remove();
      return app.currentFiles.forEach(function(file, index) {
        return onFileAdd(file, app.currentFiles, {
          index: index
        });
      });
    });
    app.currentFiles.on('reset change:selected', function() {
      $('#menu li.active').removeClass('active');
      if (app.currentFiles.selected) {
        return $("#menu li[data-id=" + app.currentFiles.selected.cid + "]").addClass('active');
      }
    });
    editName = function(file, isNew) {
      var cancel, done, input, item, save;
      if (isNew == null) {
        isNew = false;
      }
      item = $("#menu li[data-id=" + file.cid + "]");
      input = $('<input name="name" type="text">').val(file.name).appendTo(item.find('h5'));
      input.focus();
      done = function() {
        return input.remove();
      };
      cancel = function() {
        if (isNew) {
          app.currentFiles.remove(file);
          return app.files.remove(file);
        } else {
          return done();
        }
      };
      save = function() {
        var key;
        key = file.keyFromName(input.val());
        if (isNew) {
          file.key = key;
          file.save();
        } else if (file.name !== input.val()) {
          file.rename(key);
        }
        return done();
      };
      input.blur(function() {
        if (isNew) {
          return save();
        } else {
          return cancel();
        }
      });
      return input.keydown(function(event) {
        switch (event.keyCode) {
          case 13:
            return save();
          case 27:
            return cancel();
        }
      });
    };
    return $(function() {
      $('#new-file').click(function() {
        return newFile().modal({
          backdrop: 'static'
        });
      });
      $('#menu').delegate('li', 'click', function(event) {
        var file;
        if ($(event.target).closest('.actions').length) {
          return;
        }
        file = $(this).data('model');
        return location.hash = '#/' + file.url;
      });
      $('#menu').delegate('.actions a', 'click', function(event) {
        return event.preventDefault();
      });
      $('#menu').delegate('.dropdown-toggle', 'click', function(event) {
        return $(this).closest('li').find('.delete.confirm').removeClass('confirm');
      });
      $('#menu').delegate('.delete .action', 'click', function(event) {
        event.stopPropagation();
        return $(this).closest('.delete').addClass('confirm');
      });
      $('#menu').delegate('.delete .cancel', 'click', function(event) {
        event.stopPropagation();
        return $(this).closest('.delete').removeClass('confirm');
      });
      $('#menu').delegate('.delete .confirm', 'click', function() {
        var file;
        file = $(this).closest('li.menu-item').data('model');
        return file.destroy();
      });
      $('#menu').delegate('.actions .rename', 'click', function() {
        var file;
        file = $(this).closest('li.menu-item').data('model');
        return editName(file);
      });
      return $('#new-folder').click(function(event) {
        var file, name;
        event.preventDefault();
        name = 'new-folder/';
        if (app.files.selected) {
          name = app.files.selected.key + name;
        }
        while (app.currentFiles.get(name)) {
          name = name.replace(/(-(\d+))?\/$/, function(match, appended, num) {
            return '-' + (parseInt(num) + 1 || 2) + '/';
          });
        }
        file = new File({
          key: name,
          lastModified: new Date(),
          type: 'folder'
        });
        app.files.add(file);
        app.currentFiles.add(file);
        return editName(file, true);
      });
    });
  });

}).call(this);
