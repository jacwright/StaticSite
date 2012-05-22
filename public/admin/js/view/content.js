(function() {

  require(['app'], function(app) {
    var editor, modes, session;
    modes = {
      html: new (ace.require('ace/mode/html').Mode),
      js: new (ace.require('ace/mode/html').Mode),
      css: new (ace.require('ace/mode/html').Mode)
    };
    editor = ace.edit($('#code-editor').get(0));
    $('#code-editor').data('editor', editor);
    session = editor.getSession();
    session.setMode(modes.html);
    session.setUseSoftTabs(false);
    editor.renderer.setShowPrintMargin(false);
    editor.renderer.setShowGutter(true);
    editor.renderer.setHScrollBarAlwaysVisible(false);
    return app.currentFiles.on('reset change:selected', function() {
      var file;
      file = app.currentFiles.selected;
      if (!file) return;
      return file.fetch().then(function() {
        return session.setValue(file.content);
      });
    });
  });

}).call(this);
