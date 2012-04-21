define(['lib/templates'], function (templates) {

function breadcrumb(data,index) {
  var i, line, lineNumber, lines, name, source, __line, __lines, _len;

  name = "breadcrumb";

  source = "<% if data.site and app.files.selected is data: %>\n<li class=\"crumb\">\n\t<span class=\"divider\">/</span> <%= data.name %>\n</li>\n<% else if data.site: %>\n<li class=\"crumb\">\n\t<span class=\"divider\">/</span> <a href=\"<%= data.url %>\"><%= data.name %></a>\n</li>\n<% else if app.files.selected: %>\n<li class=\"crumb\">\n\t<a href=\"<%= data.url %>\"><%= data.name %></a>\n</li>\n<% else: %>\n<li class=\"crumb\">\n\t<%= data.name %>\n</li>\n<% end %>\n";

  try {
    __line = 1;
    __lines = [];
    if (data.site && app.files.selected === data) {
      __lines.push('\n');
      __line = 2;
      __lines.push('<li class="crumb">\n');
      __line = 3;
      __lines.push('\t<span class="divider">/</span> ');
      __lines.push(this.escape(data.name));
      __lines.push('\n');
      __line = 4;
      __lines.push('</li>\n');
      __line = 5;
      __lines.push('');
    } else if (data.site) {
      __lines.push('\n');
      __line = 6;
      __lines.push('<li class="crumb">\n');
      __line = 7;
      __lines.push('\t<span class="divider">/</span> <a href="');
      __lines.push(this.escape(data.url));
      __lines.push('">');
      __lines.push(this.escape(data.name));
      __lines.push('</a>\n');
      __line = 8;
      __lines.push('</li>\n');
      __line = 9;
      __lines.push('');
    } else if (app.files.selected) {
      __lines.push('\n');
      __line = 10;
      __lines.push('<li class="crumb">\n');
      __line = 11;
      __lines.push('\t<a href="');
      __lines.push(this.escape(data.url));
      __lines.push('">');
      __lines.push(this.escape(data.name));
      __lines.push('</a>\n');
      __line = 12;
      __lines.push('</li>\n');
      __line = 13;
      __lines.push('');
    } else {
      __lines.push('\n');
      __line = 14;
      __lines.push('<li class="crumb">\n');
      __line = 15;
      __lines.push('\t');
      __lines.push(this.escape(data.name));
      __lines.push('\n');
      __line = 16;
      __lines.push('</li>\n');
      __line = 17;
      __lines.push('');
    }
    __lines.push('\n');
    __line = 18;
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

return templates.get.bind(null, breadcrumb.bind(templates.helpers));

});