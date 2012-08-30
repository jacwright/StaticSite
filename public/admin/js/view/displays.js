(function() {

  define(function() {
    return {
      setDisplays: function(displays) {
        var display, doc, editor, frame, i, tab, tabContent, _i, _len;
        $('#tabs li').remove();
        $('#displays > *').remove();
        for (i = _i = 0, _len = displays.length; _i < _len; i = ++_i) {
          display = displays[i];
          tab = $('<li><a href="#display' + i + '" data-toggle="tab"></a></li>').appendTo('#tabs').find('a').text(display.label).end();
          tabContent = $('<div id="display' + i + '" class="tab-pane"></div>').appendTo('#displays');
          if (display.type === 'code') {
            editor = CodeMirror(tabContent.get(0), {
              indentUnit: 4,
              indentWithTabs: true,
              lineNumbers: true,
              theme: 'intellij'
            });
            editor.getScrollerElement().style.height = '100%';
            tabContent.data('editor', editor);
            editor.setOption('mode', display.mode || 'default');
            editor.setValue(display.content || '');
            tab.find('a').on('shown', function() {
              return editor.refresh();
            });
          } else if (display.type === 'iframe') {
            frame = $('<iframe></iframe>').appendTo(tabContent);
            doc = frame.get(0).contentDocument;
            doc.open();
            doc.write(display.content || '');
            doc.close();
          } else {
            if (display.content) {
              tabContent.append(display.content);
            }
          }
        }
        return $('#tabs li:first, #displays > *:first').addClass('active');
      }
    };
  });

}).call(this);
