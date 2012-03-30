define(['lib/templates'], function (templates) {

function menuItem(data,index) {
  var i, line, lineNumber, lines, name, source, __line, __lines, _len;

  name = "menu-item";

  source = "<li class=\"<%= if data.children.length then 'has-children' %>\">\n\t<h5 class=\"file-name\"><span class=\"icon <%= data.icon %>\"></span> <%= data.name, '' %></h5>\n\t<% if data.id.slice(-1) isnt '/': %><span class=\"date-modified\">Published: <%= data.lastModified.readable() %></span><% end %>\n</li>\n";

  try {
    __line = 1;
    __lines = [];
    __lines.push('<li class="');
    __lines.push(this.escape(data.children.length ? 'has-children' : void 0));
    __lines.push('">\n');
    __line = 2;
    __lines.push('\t<h5 class="file-name"><span class="icon ');
    __lines.push(this.escape(data.icon));
    __lines.push('"></span> ');
    __lines.push(this.escape(data.name, ''));
    __lines.push('</h5>\n');
    __line = 3;
    __lines.push('\t');
    if (data.id.slice(-1) !== '/') {
      __lines.push('<span class="date-modified">Published: ');
      __lines.push(this.escape(data.lastModified.readable()));
      __lines.push('</span>');
    }
    __lines.push('\n');
    __line = 4;
    __lines.push('</li>\n');
    __line = 5;
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

return templates.get.bind(null, menuItem.bind(templates.helpers));

});