define(['lib/templates'], function (templates) {

function newFile(data,index) {
  var i, line, lineNumber, lines, name, source, __line, __lines, _i, _len;

  name = "new-file";

  source = "<div class=\"modal fade\">\n\t<div class=\"modal-header\">\n\t\t<a class=\"close\" data-dismiss=\"modal\">×</a>\n\t\t<h3>Add a file</h3>\n\t</div>\n\t<div class=\"modal-body\">\n\t\t<ul class=\"nav nav-pills\">\n\t\t\t<li class=\"active\"><a href=\"#upload-file\" data-toggle=\"tab\">Upload</a></li>\n\t\t\t<li><a href=\"#create-file\" data-toggle=\"tab\">Create</a></li>\n\t\t</ul>\n\t\t<div class=\"tab-content\">\n\t\t\t<div id=\"upload-file\" class=\"tab-pane active\">\n\t\t\t\t<div id=\"file-drop\" class=\"hero-unit well\">\n\t\t\t\t\t<h1>Drop files here</h1>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div id=\"create-file\" class=\"tab-pane\">\n\t\t\t\t<form class=\"form-horizontal\">\n\t\t\t\t\t<div class=\"control-group\">\n\t\t\t\t\t\t<label class=\"control-label\">File name</label>\n\t\t\t\t\t\t<div class=\"controls\">\n\t\t\t\t\t\t\t<input>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class=\"control-group\">\n\t\t\t\t\t\t<label class=\"control-label\">Type</label>\n\t\t\t\t\t\t<div class=\"controls\">\n\t\t\t\t\t\t\t<input>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</form>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t<div class=\"modal-footer\">\n\t\t<button data-dismiss=\"modal\" class=\"btn\">Close</button>\n\t\t<button class=\"btn btn-primary\">Save changes</button>\n\t</div>\n</div>";

  try {
    __line = 1;
    __lines = [];
    __lines.push('<div class="modal fade">\n');
    __line = 2;
    __lines.push('\t<div class="modal-header">\n');
    __line = 3;
    __lines.push('\t\t<a class="close" data-dismiss="modal">×</a>\n');
    __line = 4;
    __lines.push('\t\t<h3>Add a file</h3>\n');
    __line = 5;
    __lines.push('\t</div>\n');
    __line = 6;
    __lines.push('\t<div class="modal-body">\n');
    __line = 7;
    __lines.push('\t\t<ul class="nav nav-pills">\n');
    __line = 8;
    __lines.push('\t\t\t<li class="active"><a href="#upload-file" data-toggle="tab">Upload</a></li>\n');
    __line = 9;
    __lines.push('\t\t\t<li><a href="#create-file" data-toggle="tab">Create</a></li>\n');
    __line = 10;
    __lines.push('\t\t</ul>\n');
    __line = 11;
    __lines.push('\t\t<div class="tab-content">\n');
    __line = 12;
    __lines.push('\t\t\t<div id="upload-file" class="tab-pane active">\n');
    __line = 13;
    __lines.push('\t\t\t\t<div id="file-drop" class="hero-unit well">\n');
    __line = 14;
    __lines.push('\t\t\t\t\t<h1>Drop files here</h1>\n');
    __line = 15;
    __lines.push('\t\t\t\t</div>\n');
    __line = 16;
    __lines.push('\t\t\t</div>\n');
    __line = 17;
    __lines.push('\t\t\t<div id="create-file" class="tab-pane">\n');
    __line = 18;
    __lines.push('\t\t\t\t<form class="form-horizontal">\n');
    __line = 19;
    __lines.push('\t\t\t\t\t<div class="control-group">\n');
    __line = 20;
    __lines.push('\t\t\t\t\t\t<label class="control-label">File name</label>\n');
    __line = 21;
    __lines.push('\t\t\t\t\t\t<div class="controls">\n');
    __line = 22;
    __lines.push('\t\t\t\t\t\t\t<input>\n');
    __line = 23;
    __lines.push('\t\t\t\t\t\t</div>\n');
    __line = 24;
    __lines.push('\t\t\t\t\t</div>\n');
    __line = 25;
    __lines.push('\t\t\t\t\t<div class="control-group">\n');
    __line = 26;
    __lines.push('\t\t\t\t\t\t<label class="control-label">Type</label>\n');
    __line = 27;
    __lines.push('\t\t\t\t\t\t<div class="controls">\n');
    __line = 28;
    __lines.push('\t\t\t\t\t\t\t<input>\n');
    __line = 29;
    __lines.push('\t\t\t\t\t\t</div>\n');
    __line = 30;
    __lines.push('\t\t\t\t\t</div>\n');
    __line = 31;
    __lines.push('\t\t\t\t</form>\n');
    __line = 32;
    __lines.push('\t\t\t</div>\n');
    __line = 33;
    __lines.push('\t\t</div>\n');
    __line = 34;
    __lines.push('\t</div>\n');
    __line = 35;
    __lines.push('\t<div class="modal-footer">\n');
    __line = 36;
    __lines.push('\t\t<button data-dismiss="modal" class="btn">Close</button>\n');
    __line = 37;
    __lines.push('\t\t<button class="btn btn-primary">Save changes</button>\n');
    __line = 38;
    __lines.push('\t</div>\n');
    __line = 39;
    __lines.push('</div>');
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

var boundTemplate = templates.get.bind(null, newFile.bind(templates.helpers));
templates.register('new-file', boundTemplate);
return boundTemplate;

});