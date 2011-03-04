(function() {
	var baseUri = location.protocol + "//" + location.host;
	var relativeUri = location.href.replace(/[^\/]*$/, '');
	var moduleUri = relativeUri;
	var moduleClosures = {};
	var modules = {};
	var loading = [];
	var main;
	
	window.require = function require(moduleId) {
		loadModuleSync(moduleId);
		return getModule(moduleId).exports;
	};
	
	
	require.root = function(uri) {
		if (!arguments.length) return moduleUri;
		if (uri.slice(-1) != '/') uri += '/';
		if (uri.charAt(0) == '/') moduleUri = baseUri + uri;
		else if (uri.indexOf('://') == -1) moduleUri = relativeUri + uri;
		else moduleUri = uri;
	};
	
	require.run = function(moduleId) {
		if (moduleClosures.hasOwnProperty(moduleId)) return getModule(moduleId).exports;
		else loadModule(main = moduleId, '');
	};
	
	require.addModuleClosure = function(moduleId, closure) {
		moduleClosures[moduleId] = closure;
	};
	
	
	function getModule(moduleId) {
		if (modules.hasOwnProperty(moduleId)) return modules[moduleId];
		else if (moduleClosures.hasOwnProperty(moduleId)) return runModule(moduleId);
		else throw new Error('Module "' + moduleId + '" does not exist.');
	}
	
	function runModule(moduleId) {
		var module = {
			id: moduleId,
			uri: moduleUri + moduleId + '.js',
			exports: { extend: extend }
		};
		modules[moduleId] = module;
		moduleClosures[moduleId].call(window, createRequire(moduleId), module.exports, module);
		return module;
	}
	
	function createRequire(currentModuleId) {
		var require = function(moduleId) {
			moduleId = resolveModuleId(moduleId, currentModuleId);
			return getModule(moduleId).exports;
		};
		if (main) require.main = getModule(main);
		return require;
	}
	
	
	function loadModule(moduleId, currentModuleId) {
		moduleId = resolveModuleId(moduleId, currentModuleId);
		if (moduleClosures.hasOwnProperty(moduleId)) return;
		var file = moduleUri + moduleId + '.js';
		
		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('GET', file, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				var i = loading.indexOf(xhr);
				if (i == -1) return;
				loading.splice(i, 1);
				if (xhr.status == 200) {
					var code = xhr.responseText;
					moduleClosures[moduleId] = new Function('require', 'exports', 'module', code);
					findRequired(code, moduleId);
					
					// if finished loading all dependencies start the run
					if (!loading.length && main) require.run(main);
				} else {
					moduleError(moduleId, currentModuleId);
				}
			}
		};

		loading.push(xhr);
		xhr.send(null);
	}
	
	function loadModuleSync(moduleId, currentModuleId) {
		moduleId = resolveModuleId(moduleId, currentModuleId);
		if (moduleClosures.hasOwnProperty(moduleId)) return;
		var file = moduleUri + moduleId + '.js';
		
		var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
		xhr.open('GET', file, false);
		xhr.send(null);
		var code = xhr.responseText;
		moduleClosures[moduleId] = new Function('require', 'exports', 'module', code);
		findRequired(code, moduleId, true);
	}
	
	function findRequired(code, moduleId, sync) {
		var match, requireRegex = /\brequire\(("|')(.+?)\1\)/g;
		while (match = requireRegex.exec(code)) {
			sync ? loadModuleSync(match[2], moduleId) : loadModule(match[2], moduleId);
		}
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
	
	function extend(source) {
		for (var i in source) {
			if (source.hasOwnProperty(i)) {
				this[i] = source[i];
			}
		}
		return this;
	}
	
	function checkAutoRun() {
		// call require.run automatically if declared in script tag
		var scripts = document.getElementsByTagName('script');
		var main;
		for (var i = 0; i < scripts.length; i++) {
			if (main = scripts[i].getAttribute('data-main')) {
				if (scripts[i].hasAttribute('data-root')) {
					require.root(scripts[i].getAttribute('data-root'));
				} else {
					var src = scripts[i].getAttribute('src');
					require.root(src.replace(/[^\/]+$/, ''));
				}
				require.run(main);
			}
		}
	}
	
	checkAutoRun();
	
})();
