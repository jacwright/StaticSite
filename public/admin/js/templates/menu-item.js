define(['lib/templates'], function (templates) {

function menuItem(data,index) {
  var i, line, lineNumber, lines, name, source, __line, __lines, _len;

  name = "menu-item";

  source = "<li data-id=\"<%= data.cid %>\" class=\"menu-item<%= if data.children.length then ' has-children' %><%= if app.currentFiles.selected is data then ' active' %>\">\n\t<h5 class=\"file-name\">\n\t\t<span class=\"icon <%= data.icon %>\"></span>\n\t\t<%= data.name %>\n\t\t<% unless data.nonStandard: %>\n\t\t<div class=\"actions pull-right dropdown\">\n\t\t\t<a class=\"dropdown-toggle\" data-toggle=\"dropdown\" href=\"#\">\n\t\t\t\t<span class=\"icon cog\"></span>\n\t\t\t</a>\n\t\t\t<ul class=\"dropdown-menu\">\n\t\t\t\t<li class=\"delete\">\n\t\t\t\t\t<a class=\"action\" href=\"#\">Delete</a>\n\t\t\t\t\t<span class=\"confirmation\">\n\t\t\t\t\t\t<strong>Delete?</strong> <span class=\"pull-right\"><a class=\"confirm\" href=\"#\">Yes</a> or <a class=\"cancel\" href=\"#\">Cancel</a></span>\n\t\t\t\t\t</span>\n\t\t\t\t</li>\n\t\t\t\t<li><a class=\"rename\" href=\"#\">Rename</a></li>\n\t\t\t</ul>\n\t\t</div>\n\t\t<% end %>\n\t</h5>\n\t<% if data.id.slice(-1) isnt '/' and data.lastModified: %><span class=\"date-modified\">Published: <%= data.lastModified.readable() %></span><% end %>\n</li>\n";

  try {
    __line = 1;
    __lines = [];
    __lines.push('<li data-id="');
    __lines.push(this.escape(data.cid));
    __lines.push('" class="menu-item');
    __lines.push(this.escape(data.children.length ? ' has-children' : void 0));
    __lines.push(this.escape(app.currentFiles.selected === data ? ' active' : void 0));
    __lines.push('">\n');
    __line = 2;
    __lines.push('\t<h5 class="file-name">\n');
    __line = 3;
    __lines.push('\t\t<span class="icon ');
    __lines.push(this.escape(data.icon));
    __lines.push('"></span>\n');
    __line = 4;
    __lines.push('\t\t');
    __lines.push(this.escape(data.name));
    __lines.push('\n');
    __line = 5;
    __lines.push('\t\t');
    if (!data.nonStandard) {
      __lines.push('\n');
      __line = 6;
      __lines.push('\t\t<div class="actions pull-right dropdown">\n');
      __line = 7;
      __lines.push('\t\t\t<a class="dropdown-toggle" data-toggle="dropdown" href="#">\n');
      __line = 8;
      __lines.push('\t\t\t\t<span class="icon cog"></span>\n');
      __line = 9;
      __lines.push('\t\t\t</a>\n');
      __line = 10;
      __lines.push('\t\t\t<ul class="dropdown-menu">\n');
      __line = 11;
      __lines.push('\t\t\t\t<li class="delete">\n');
      __line = 12;
      __lines.push('\t\t\t\t\t<a class="action" href="#">Delete</a>\n');
      __line = 13;
      __lines.push('\t\t\t\t\t<span class="confirmation">\n');
      __line = 14;
      __lines.push('\t\t\t\t\t\t<strong>Delete?</strong> <span class="pull-right"><a class="confirm" href="#">Yes</a> or <a class="cancel" href="#">Cancel</a></span>\n');
      __line = 15;
      __lines.push('\t\t\t\t\t</span>\n');
      __line = 16;
      __lines.push('\t\t\t\t</li>\n');
      __line = 17;
      __lines.push('\t\t\t\t<li><a class="rename" href="#">Rename</a></li>\n');
      __line = 18;
      __lines.push('\t\t\t</ul>\n');
      __line = 19;
      __lines.push('\t\t</div>\n');
      __line = 20;
      __lines.push('\t\t');
    }
    __lines.push('\n');
    __line = 21;
    __lines.push('\t</h5>\n');
    __line = 22;
    __lines.push('\t');
    if (data.id.slice(-1) !== '/' && data.lastModified) {
      __lines.push('<span class="date-modified">Published: ');
      __lines.push(this.escape(data.lastModified.readable()));
      __lines.push('</span>');
    }
    __lines.push('\n');
    __line = 23;
    __lines.push('</li>\n');
    __line = 24;
    __lines.push('');
    return __lines.join('');
  } catch (error) {
    lines = source.split(/\n/);
    for (i = 0, _len = lines.length; i < _len; i++) {
      line = lines[i];
      lineNumber = i < 9 ? '  ' + (i + 1) : i < 109 ? ' ' + (i + 1) : i + 1;
      lines[i] = (i === __line - 1 ? "=>|" + lineNumber + "|" : "  |" + lineNumber + "|") + line;
    }
    error.message += '\nin template ' + name + ' on line ' + __line + '\n' + lines.join('\n');
    throw error;
  }

}

var boundTemplate = templates.get.bind(null, menuItem.bind(templates.helpers));
templates.register('menu-item', boundTemplate);
return boundTemplate;

});