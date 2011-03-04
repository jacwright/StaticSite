#! /usr/bin/env node
// -*- js2 -*-

global.sys = require(/^v0\.[012]/.test(process.version) ? "sys" : "util");
var fs = require("fs");
var uglify = require("uglify-js"), // symlink ~/.node_libraries/uglify-js.js to ../uglify-js.js
    jsp = uglify.parser,
    pro = uglify.uglify;

pro.set_logger(function(msg){
	sys.debug(msg);
});

var options = {
	ast: false,
	mangle: true,
	mangle_toplevel: false,
	squeeze: true,
	make_seqs: true,
	dead_code: true,
	beautify: false,
	verbose: false,
	show_copyright: true,
	out_same_file: false,
	max_line_length: 32 * 1024,
	unsafe: false,
	beautify_options: {
		indent_level: 4,
		indent_start: 0,
		quote_keys: false,
		space_colon: false
	},
	output: true	    // stdout
};

var args = jsp.slice(process.argv, 2);
var filenames = [];
var main;
var paths = [];
var combine;
var commonjs = false;
var forceCommonJS = false;
var time = new Date().getTime();

while (args.length > 0) {
	var v = args.shift();
	switch (v) {
	    case "-b":
	    case "--beautify":
		options.beautify = true;
		break;
	    case "-i":
	    case "--indent":
		options.beautify_options.indent_level = args.shift();
		break;
	    case "-q":
	    case "--quote-keys":
		options.beautify_options.quote_keys = true;
		break;
	    case "-mt":
	    case "--mangle-toplevel":
		options.mangle_toplevel = true;
		break;
	    case "--no-mangle":
	    case "-nm":
		options.mangle = false;
		break;
	    case "--no-squeeze":
	    case "-ns":
		options.squeeze = false;
		break;
	    case "--no-seqs":
		options.make_seqs = false;
		break;
	    case "--no-dead-code":
		options.dead_code = false;
		break;
	    case "--no-copyright":
	    case "-nc":
		options.show_copyright = false;
		break;
	    case "-o":
	    case "--ouput":
	    case "-cp":
	    case "--compile":
		options.output = args.shift();
		break;
	    case "--overwrite":
		options.out_same_file = true;
		break;
	    case "-v":
	    case "--verbose":
		options.verbose = true;
		break;
	    case "--ast":
		options.ast = true;
		break;
	    case "--unsafe":
		options.unsafe = true;
		break;
	    case "--max-line-len":
		options.max_line_length = parseInt(args.shift(), 10);
		break;
		case "-m":
		case "--main":
		main = args.shift();
		commonjs = true;
		break;
		case "-p":
		case "--path":
		paths.push(args.shift().replace(/\/?$/, '/'));
		break;
		case "-cb":
		case "--combine":
		combine = args.shift();
		break;
		case "--commonjs":
		case "-cm":
		commonjs = true;
		break;
		case "--force-commonjs":
		case "-fcm":
		forceCommonJS = true;
		break;
	    default:
		filenames.push(v);
		break;
	}
}

/////// CUSTOM COMBINER

RegExp.escape = function(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

var modules = {};
var combined = '';
var loading = 0;
var files = [];
//var rootRegex = root ? new RegExp('^' + RegExp.escape(root)) : undefined;
var requireRegex = /\brequire\(("|')(.+?)\1\)/g;
var reqOrExpRegex = /\brequire\(("|')(.+?)\1\)|\bexports.+=/;


function finish(text) {
	if (combine) {
		console.log('loaded...', '(' + (new Date().getTime() - time) + 'ms)');
		time = new Date().getTime();
		
		fs.writeFile(combine, text, function (err) {
			if (err) throw err;
			if (options.output !== true) {
				console.log('combined...', '(' + (new Date().getTime() - time) + 'ms)');
				time = new Date().getTime();
				output(squeeze_it(text));
			} else {
				console.log('combined!', '(' + (new Date().getTime() - time) + 'ms)')
			}
		});
	} else {
		output(squeeze_it(text));
	}
}


function loadModule(moduleId, currentModuleId, pathIndex) {
	moduleId = resolveModuleId(moduleId, currentModuleId);
	if (modules.hasOwnProperty(moduleId)) return;
	
	pathIndex = pathIndex || 0;
	var file = paths[pathIndex] + moduleId + '.js';
	++loading;
	
	fs.readFile(file, "utf8", function(err, code){
		if (err) {
			if (++pathIndex == paths.length) throw new Error('No module "' + moduleId + '" exists in paths [' + paths.join(', ') + ']');
			--loading;
			loadModule(moduleId, currentModuleId, pathIndex);
			return;
		}
		
		modules[moduleId] = true;
		findRequired(code, moduleId);
		combined += 'require.addModuleClosure("' + moduleId + '", function(require, exports, module) {\n' + code + '\n});\n\n';
		
		// if finished loading all dependencies finish combine and minimize it
		if (!--loading && main) {
			combined += 'require.run("' + main + '");';
			finish(combined);
		}
	});
}

function loadFile(file) {
	var order = loading++;
	files[order] = false;
	var exempt = false;
	if (file.slice(-1) == '^') {
		exempt = true;
		file = file.slice(0, -1);
	}
	
	fs.readFile(file, "utf8", function(err, code) {
		if (err) throw err;
		
		if ((forceCommonJS && !exempt) || (commonjs && !exempt && hasRequireOrExports(code))) {
			var moduleId;
			if (paths.length) {
				var sortedPaths = paths.slice().sort(function(a, b) {
					return b.length - a.length;
				});
				for (var i = 0; i < sortedPaths.length; i++) {
					var exp = new RegExp('^' + RegExp.escape(sortedPaths[i]));
					if (exp.test(file)) {
						moduleId = file.replace(exp, '');
						break;
					}
				}
			} else {
				paths.push(file.replace(/[^/]+$/, ''));
			}
			moduleId = moduleId.replace(/\.js$/, '');
			findRequired(code, moduleId);
			code = 'require.addModuleClosure("' + moduleId + '", function(require, exports, module) {\n' + code + '\n});';
		}
		
		files[order] = code;
		
		if (order == 0 || files[order - 1] === true) {
			while (files[order]) {
				combined += files[order] + '\n\n';
				files[order++] = true;
			}
		}
		
		if (!--loading) {
			if (main) loadMain();
			else finish(combined);
		}
	});
}

function hasRequireOrExports(code) {
	return reqOrExpRegex.test(code);
}

function findRequired(code, moduleId) {
	var match, hasRequire = false;
	while (match = requireRegex.exec(code)) {
		hasRequire = true;
		loadModule(match[2], moduleId);
	}
	return hasRequire;
}

function resolveModuleId(moduleId, currentModuleId) {
	if (moduleId.charAt(0) == '.') {
		var path = currentModuleId.split('/');
		var parts = moduleId.split('/');
		path.pop();
		if (moduleId.slice(0, 3) == '../') {
			while (parts[0] == '..') {
				if (!path.length) moduleError(moduleId, currentModuleId);
				parts.shift();
				path.pop();
			}
			return (path.length ? path.join('/') + '/' : '') + parts.join('/');
		} else if (moduleId.slice(0, 2) == './') {
			parts.shift();
			return path.join('/') + '/' + parts.join('/');
		}
	}
	return moduleId;
}

function moduleError(moduleId, currentModuleId) {
	var from = currentModuleId ? ' require()\'d from module "' + currentModuleId + '"' : '';
	throw new Error('Could not load module "' + moduleId + '"' + from);
}

function loadMain() {
	if (!root) {
		root = main.replace(/[^\/]+$/, '');
		main = main.replace(/.*\/([^\/]+)$/, '$1');
	}
	main = main.replace(/\.js$/, '');
	loadModule(main);
}

///////



if (filenames.length) {
	filenames.forEach(loadFile);
} else if (main) {
	loadMain();
} else {
	var stdin = process.openStdin();
	stdin.setEncoding("utf8");
	var text = "";
	stdin.on("data", function(chunk){
		text += chunk;
	});
	stdin.on("end", function() {
		output(squeeze_it(text));
	});
}

function output(text) {
	var out;
	if (options.out_same_file && filename)
		options.output = filename;
	if (options.output === true) {
		out = process.stdout;
	} else {
		out = fs.createWriteStream(options.output, {
			flags: "w",
			encoding: "utf8",
			mode: 0644
		});
	}
	out.write(text);
	out.on('close', function() {
		console.log('compiled!', '(' + (new Date().getTime() - time) + 'ms)');
	});
	if (options.output !== true) {
		out.end();
	}
};

// --------- main ends here.

function show_copyright(comments) {
	var ret = "";
	for (var i = 0; i < comments.length; ++i) {
		var c = comments[i];
		if (c.type == "comment1") {
			ret += "//" + c.value + "\n";
		} else {
			ret += "/*" + c.value + "*/";
		}
	}
	return ret;
};

function squeeze_it(code) {
	var result = "";
	if (options.show_copyright) {
		var tok = jsp.tokenizer(code), c;
		c = tok();
		result += show_copyright(c.comments_before);
	}
	try {
		var ast = time_it("parse", function(){ return jsp.parse(code); });
		if (options.mangle)
			ast = time_it("mangle", function(){ return pro.ast_mangle(ast, options.mangle_toplevel); });
		if (options.squeeze)
			ast = time_it("squeeze", function(){
				ast = pro.ast_squeeze(ast, {
					make_seqs  : options.make_seqs,
					dead_code  : options.dead_code,
					keep_comps : !options.unsafe
				});
				if (options.unsafe)
					ast = pro.ast_squeeze_more(ast);
				return ast;
			});
		if (options.ast)
			return sys.inspect(ast, null, null);
		result += time_it("generate", function(){ return pro.gen_code(ast, options.beautify && options.beautify_options) });
		if (!options.beautify && options.max_line_length) {
			result = time_it("split", function(){ return pro.split_lines(result, options.max_line_length) });
		}
		return result;
	} catch(ex) {
		sys.debug(ex.stack);
		sys.debug(sys.inspect(ex));
		sys.debug(JSON.stringify(ex));
	}
};

function time_it(name, cont) {
	if (!options.verbose)
		return cont();
	var t1 = new Date().getTime();
	try { return cont(); }
	finally { sys.debug("// " + name + ": " + ((new Date().getTime() - t1) / 1000).toFixed(3) + " sec."); }
};