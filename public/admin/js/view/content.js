(function() {

  require(['app', 'view/displays'], function(app, displays) {
    var images, localize, modes;
    modes = {
      txt: 'default',
      html: 'htmlmixed',
      js: 'javascript',
      css: 'css'
    };
    images = {
      gif: true,
      jpg: true,
      jpeg: true,
      png: true,
      tiff: true
    };
    app.currentFiles.on('reset change:selected', function() {
      var ext, file;
      file = app.currentFiles.selected;
      if (file) {
        ext = file.key.split('.').pop().toLowerCase();
        if (file.type === 'image') {
          return displays.setDisplays([
            {
              type: 'iframe',
              label: 'Image',
              content: "<html>\n<head>\n<style>body{text-align:center;margin:0;padding:20px;}img{max-width:100%;max-height:1000px;background-image:url(img/checker.png);-moz-box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);-webkit-box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);box-shadow: 0px 3px 10px rgba(0, 0, 0, 0.5);}</style>\n</head>\n<body>\n<img src=\"" + ('/' + file.site.name + '/' + file.key) + "\" alt=\"\">\n</body>\n</html>"
            }
          ]);
        } else if (file.name === 'index.html' && file.parent.type === 'admin-folder') {
          return displays.setDisplays([
            {
              type: 'iframe',
              label: 'Admin',
              content: ''
            }
          ]);
        } else if (ext === 'html') {
          return file.fetch().then(function() {
            return displays.setDisplays([
              {
                type: 'iframe',
                label: 'View',
                content: localize(file.content, '/' + file.site.name)
              }, {
                type: 'code',
                label: 'Edit',
                mode: modes.html,
                content: file.content
              }
            ]);
          });
        } else {
          return file.fetch().then(function() {
            return displays.setDisplays([
              {
                type: 'code',
                label: 'Edit',
                mode: modes[ext],
                content: file.content
              }
            ]);
          });
        }
      } else {
        return displays.setDisplays([]);
      }
    });
    return localize = function(content, base) {
      window.content = content;
      content = content.replace(/(<[^>]*?href=")(\/[^\/])/g, '$1' + base + '$2');
      content = content.replace(/(<a[^>]*?)(href=")(\/[^\/])/g, '$1target="_parent" $2#$3');
      content = content.replace(/(<a[^>]*?)(href=")([^#])/g, '$1target="_blank" $2$3');
      content = content.replace(/(<[^>]*?src=")(\/[^\/])/g, '$1' + base + '$2');
      return content;
    };
  });

}).call(this);
