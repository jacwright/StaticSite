define(['lib/templates'], function (templates) {

function siteMenuItem(data,index) {
  var i, line, lineNumber, lines, name, source, __line, __lines, _i, _len;

  name = "site-menu-item";

  source = "<li>\n\t<a href=\"<%= data.url %>\"><span class=\"icon <%= data.icon %>\"></span> <%= data.name %></a>\n</li>";

  try {
    __line = 1;
    __lines = [];
    __lines.push('<li>\n');
    __line = 2;
    __lines.push('\t<a href="');
    __lines.push(this.escape(data.url));
    __lines.push('"><span class="icon ');
    __lines.push(this.escape(data.icon));
    __lines.push('"></span> ');
    __lines.push(this.escape(data.name));
    __lines.push('</a>\n');
    __line = 3;
    __lines.push('</li>');
    return __lines.join('');
  } catch (error) {
    lines = source.split(/\n/);
    for (i = _i = 0, _len = lines.length; _i < _len; i = ++_i) {
      line = lines[i];
      lineNumber = i < 9 ? '  ' + (i + 1) : i < 109 ? ' ' + (i + 1) : i + 1;
      lines[i] = (i === __line - 1 ? "=>|" + lineNumber + "|" : "  |" + lineNumber + "|") + line;
    }
    error.message += '\nin template ' + name + ' on line ' + __line + '\n' + lines.join('\n');
    throw error;
  }

}

var boundTemplate = templates.get.bind(null, siteMenuItem.bind(templates.helpers));
templates.register('site-menu-item', boundTemplate);
return boundTemplate;

});