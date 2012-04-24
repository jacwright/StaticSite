(function() {

  require(['app', 'model/file', 'model/folder', 'templates/menu-item', 'templates/new-file'], function(app, File, Folder, menuItem, newFile) {
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
    app.children.on('add', onFileAdd);
    app.children.on('remove', function(file, files, options) {
      return $("#menu li[data-id=" + file.cid + "]").remove();
    });
    app.children.on('reset', function() {
      $('#menu ul li').remove();
      return app.children.forEach(function(file, index) {
        return onFileAdd(file, app.children, {
          index: index
        });
      });
    });
    app.children.on('reset change:selected', function() {
      $('#menu li.active').removeClass('active');
      if (app.children.selected) {
        return $("#menu li[data-id=" + app.children.selected.cid + "]").addClass('active');
      }
    });
    editName = function(file, isNew) {
      var cancel, done, input, item, save;
      if (isNew == null) isNew = false;
      item = $("#menu li[data-id=" + file.cid + "]");
      input = $('<input name="name" type="text">').val(file.name).appendTo(item.find('h5'));
      input.focus();
      done = function() {
        return input.remove();
      };
      cancel = function() {
        if (isNew) {
          app.children.remove(file);
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
        if ($(event.target).closest('.actions').length) return;
        return app.children.selected = app.children.get($(this).data('model').id);
      });
      $('#menu').delegate('li', 'dblclick', function() {
        var file;
        file = $(this).data('model');
        if (file.isFolder) {
          return app.files.selected = app.children.get($(this).data('model').id);
        }
      });
      $('#menu').delegate('.actions a', 'click', function(event) {
        return event.preventDefault();
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
        if (app.files.selected) name = app.files.selected.key + name;
        while (app.children.get(name)) {
          name = name.replace(/(-(\d+))?\/$/, function(match, appended, num) {
            return '-' + (parseInt(num) + 1 || 2) + '/';
          });
        }
        file = new Folder({
          key: name,
          lastModified: new Date()
        });
        app.files.add(file);
        app.children.add(file);
        return editName(file, true);
      });
    });
  });

}).call(this);
