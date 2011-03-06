var Class = require('class').Class,
	b64_md5_digest = require('crypto').b64_md5_digest,
	utf8 = require('crypto').utf8,
	b64_hmac_sha1 = require('crypto').b64_hmac_sha1,
	when = require('promise').when,
	_ = require('underscore')._;


var url = location.protocol + '//' + location.hostname + location.pathname.replace(/^(\/[^\/]+).*/, '$1');
var key;
var secret;


var s3 = exports.s3 = {
	
	auth: function(thekey, thesecret) {
		key = thekey;
		secret = thesecret;
	},
	
	bucket: function(name) {
		return new Bucket(name);
	},
	
	list: function() {
		return s3.load('get', url);
	},
	
	get: function(path) {
		return s3.load('get', url + path);
	},
	
	put: function(path, data, options) {
		return s3.load('put', url + path, data, options);
	},
	
	destroy: function(path) {
		return s3.load('delete', url + path);
	},
	
	load: function(options) {
		
		var headers = options.headers || {};
		var method = options.method.toLowerCase() || 'get';
		var url = addQueryParams(options.url, options.params);
		var resource = url.split('?');
		var params = resource.length > 1 ? resource.pop().split('&') : [];
		resource = addQueryParams(resource[0], params.filter(signedHeader.test));
		var date = new Date().formatGMT('D, d M Y H:i:s \\G\\M\\T');
		var data = options.data;
		var contentType = options.contentType || '';
		var contentMD5 = '';
		var amz = [];
		
		if (contentType || (method == 'put' && data)) {
			if (!contentType) {
				var ext = url.split('?').shift().replace(/^.*\./, '').toLowerCase();
				contentType = headers['Content-Type'] || mimeTypes[ext] || 'application/octet-stream';
			}
			headers['Content-Type'] = contentType;
			contentMD5 = headers['Content-MD5'] = b64_md5_digest(data); // needs to be base64 md5-digest
		}
		
		headers['x-amz-date'] = date;
		amz.push('x-amz-date:' + date);
		
		if (options.acl) {
			headers['x-amz-acl'] = options.acl;
			amz.push('x-amz-acl:' + options.acl);
		}
		
		if (options.meta) {
			var meta = options.meta;
			for (var i in meta) {
				if (!meta.hasOwnProperty(i)) continue;
				var name = i;
				var value = meta[i].replace(/\n/g, ' ');
				headers['x-amz-meta-' + name] = value;
				amz.push('x-amz-meta-' + name + ':' + value);
			}
		}
		
		if (!options.anonymous) {
			var amzString = '';
			if (amz.length) amzString = amz.sort().join('\n') + '\n';
			
			var stringToSign = [
				method.toUpperCase(),
				contentMD5,
				contentType,
				'', // empty Date header, we're using x-amz-date instead for browser compatability
				amzString + resource
			].join('\n');
			
			var signature = b64_hmac_sha1(secret, utf8.encode(stringToSign));
			headers['Authorization'] = 'AWS ' + key + ':' + signature;
		}
		
		return when($.ajax({
			type: method,
			url: url,
			headers: headers,
			data: data
		})).then(function(array) {
			return array[0];
		}, function(xhr) {
			var xml = $(xhr.responseText);
			if (xml.find('code').text() == 'SignatureDoesNotMatch') {
				console.error('Signature does not match, expected:\n', xml.find('StringToSign').text().replace(/\n/g, '\\n'), '\nactual:\n', stringToSign.replace(/\n/g, '\\n'));
			}
			return new Error(xml.find('code').text());
		});
	}
};


var Bucket = new Class({
	
	constructor: function(name) {
		this.name = name;
		this.url = '/' + name + '/';
	},
	
	list: function(folder, options) {
		url = this.url;
		options = _.extend(options || {}, {
			method: 'get',
			url: url
		});
		if (folder) {
			(options.params || (options.params = {})).prefix = folder;
		}
		return s3.load(options).then(xmlToObj.bind(null, ['contents']));
	},
	
	get: function(url, options) {
		url = this.url + url;
		options = _.extend(options || {}, {
			method: 'get',
			url: url
		});
		return s3.load(options);
	},
	
	put: function(url, data, options) {
		url = this.url + url;
		options = _.extend(options || {}, {
			method: 'put',
			url: url,
			data: data
		});
		return s3.load(options);
	},
	
	destroy: function(url, options) {
		url = this.url + url;
		options = _.extend(options || {}, {
			method: 'delete',
			url: url
		});
		return s3.load(options);
	}
});



var old = {
	
    /**
        Get contents of a key in a bucket.
    */
    get: function(bucket, key, cb, err_cb) {
        return this.httpClient({
            method:   'GET',
            resource: '/' + bucket + '/' + key,
            load: function(req, obj) {
                if (cb)     return cb(req, req.responseText);
            },
            error: function(req, obj) {
                if (err_cb) return err_cb(req, obj);
                if (cb)     return cb(req, req.responseText);
            }
        })
    },

    /**
        Head the meta of a key in a bucket.
    */
    head: function(bucket, key, cb, err_cb) {
        return this.httpClient({
            method:   'HEAD',
            resource: '/' + bucket + '/' + key,
            load: function(req, obj) {
                if (cb)     return cb(req, req.responseText);
            },
            error: function(req, obj) {
                if (err_cb) return err_cb(req, obj);
                if (cb)     return cb(req, req.responseText);
            }
        })
    },

    /**
        Put data into a key in a bucket.
    */
    put: function(bucket, key, content/*, [params], cb, [err_cb]*/) {

        // Process variable arguments for optional params.
        var idx = 3;
        var params = {};
        if (typeof arguments[idx] == 'object')
            params = arguments[idx++];
        var cb     = arguments[idx++];
        var err_cb = arguments[idx++];

        if (!params.content_type) 
            params.content_type = this.DEFAULT_CONTENT_TYPE;
        if (!params.acl)
            params.acl = this.DEFAULT_ACL;

        return this.httpClient({
            method:       'PUT',
            resource:     '/' + bucket + '/' + key,
            content:      content,
            content_type: params.content_type,
            meta:         params.meta,
            acl:          params.acl,
            load: function(req, obj) {
                if (cb)     return cb(req);
            },
            error: function(req, obj) {
                if (err_cb) return err_cb(req, obj);
                if (cb)     return cb(req, obj);
            }
        });
    },

    /**
        List buckets belonging to the account.
    */
    listBuckets: function(cb, err_cb) {
        return this.httpClient({ 
            method:'GET', resource:'/', 
            force_lists: [ 'ListAllMyBucketsResult.Buckets.Bucket' ],
            load: cb, error:err_cb 
        });
    },

    /**
        Create a new bucket for this account.
    */
    createBucket: function(bucket, cb, err_cb) {
        return this.httpClient({ 
            method:'PUT', resource:'/'+bucket, load:cb, error:err_cb 
        });
    },

    /**
        Delete an empty bucket.
    */
    deleteBucket: function(bucket, cb, err_cb) {
        return this.httpClient({ 
            method:'DELETE', resource:'/'+bucket, load:cb, error:err_cb 
        });
    },

    /**
        Given a bucket name and parameters, list keys in the bucket.
    */
    listKeys: function(bucket, params, cb, err_cb) {
        return this.httpClient({
            method:'GET', resource: '/'+bucket, 
            force_lists: [ 'ListBucketResult.Contents' ],
            params:params, load:cb, error:err_cb
        });
    },

    /**
        Delete a single key in a bucket.
    */
    deleteKey: function(bucket, key, cb, err_cb) {
        return this.httpClient({
            method:'DELETE', resource: '/'+bucket+'/'+key, load:cb, error:err_cb
        });
    },

    /**
        Delete a list of keys in a bucket, with optional callbacks
        for each deleted key and when list deletion is complete.
    */
    deleteKeys: function(bucket, list, one_cb, all_cb) {
        var _this = this;
        
        // If the list is empty, then fire off the callback.
        if (!list.length && all_cb) return all_cb();

        // Fire off key deletion with a callback to delete the 
        // next part of list.
        var key = list.shift();
        this.deleteKey(bucket, key, function() {
            if (one_cb) one_cb(key);
            _this.deleteKeys(bucket, list, one_cb, all_cb);
        });
    }

};
	
function addQueryParams(url, params) {
	var query = params instanceof Array ? params : [];
	
	if (params && params !== query) {
		for (var i in params) {
			if (!params.hasOwnProperty(i)) continue;
			query.push(i + '=' + encodeURIComponent(params[i]));
		}
	}
	
	var index;
	if ( (index = url.indexOf('?')) != -1) {
		query = query.concat(url.slice(index + 1).split('&'));
		url = url.slice(0, index);
	}
	
	if (query.length) {
		query.sort();
		url += '?' + query.join('&');
	}
	return url;
}

var signedHeader = /^(versioning|location|acl|torrent|versionid)/;
signedHeader.test = signedHeader.test.bind(signedHeader);

function xmlToObj(xml, arrayProps) {
	if (xml instanceof Array) {
		var tmp = xml;
		xml = arrayProps.firstChild;
		arrayProps = tmp;
	}
	
	// if this isn't really xml return it
	if (!xml.nodeType) return xml;
	
	if (xml.childNodes.length == 1 && xml.firstChild.nodeType == 3) return xml.firstChild.nodeValue;
	
	var obj = {};
	var arrprops = {};
	if (arrayProps) {
		arrayProps.forEach(function(prop) {
			arrprops[prop] = true;
			obj[prop] = [];
		});
	}
	
	var children = xml.childNodes;
	for (var i = 0, l = children.length; i < l; i++) {
		var child = children[i];
		var name = child.nodeName.replace(/^[A-Z]+/, function(match) {
			return match.toLowerCase();
		});
		var value = toType(xmlToObj(child));
		if (arrprops[name]) obj[name].push(value);
		else obj[name] = value;
	}
	
	return obj;
}

function toType(value) {
	if (typeof value !== 'string') return value;
	var match;
	
	for (var i = 0; i < types.length; i++) {
		var type = types[i];
		if (match = value.match(type.exp)) {
			return type.cast(match);
		}
	}
	return value;
}

var types = [
	{
		exp: /^true|false$/,
		cast: function(match) {
			return match == 'true';
		}
	},
	{
		exp: /^[\d\.]+$/,
		cast: function(match) {
			return parseFloat(match[0]);
		}
	},
	{
		exp: /^[\d\.]+$/,
		cast: function(match) {
			return parseFloat(match[0]);
		}
	},
	{
		exp: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/,
		cast: function(match) {
			return new Date(Date.UTC(match[1], parseInt(match[2]) + 1, match[3], match[4], match[5], match[6], match[7]));
		}
	}
]


var mimeTypes = exports.mimeTypes = {
	"323": "text/h323",
	"acx": "application/internet-property-stream",
	"ai": "application/postscript",
	"aif": "audio/x-aiff",
	"aifc": "audio/x-aiff",
	"aiff": "audio/x-aiff",
	"asf": "video/x-ms-asf",
	"asr": "video/x-ms-asf",
	"asx": "video/x-ms-asf",
	"au": "audio/basic",
	"avi": "video/x-msvideo",
	"axs": "application/olescript",
	"bas": "text/plain",
	"bcpio": "application/x-bcpio",
	"bin": "application/octet-stream",
	"bmp": "image/bmp",
	"c": "text/plain",
	"cat": "application/vnd.ms-pkiseccat",
	"cdf": "application/x-cdf",
	"cer": "application/x-x509-ca-cert",
	"class": "application/octet-stream",
	"clp": "application/x-msclip",
	"cmx": "image/x-cmx",
	"cod": "image/cis-cod",
	"cpio": "application/x-cpio",
	"crd": "application/x-mscardfile",
	"crl": "application/pkix-crl",
	"crt": "application/x-x509-ca-cert",
	"csh": "application/x-csh",
	"css": "text/css",
	"dcr": "application/x-director",
	"der": "application/x-x509-ca-cert",
	"dir": "application/x-director",
	"dll": "application/x-msdownload",
	"dms": "application/octet-stream",
	"doc": "application/msword",
	"dot": "application/msword",
	"dvi": "application/x-dvi",
	"dxr": "application/x-director",
	"eps": "application/postscript",
	"etx": "text/x-setext",
	"evy": "application/envoy",
	"exe": "application/octet-stream",
	"fif": "application/fractals",
	"flr": "x-world/x-vrml",
	"gif": "image/gif",
	"gtar": "application/x-gtar",
	"gz": "application/x-gzip",
	"h": "text/plain",
	"hdf": "application/x-hdf",
	"hlp": "application/winhlp",
	"hqx": "application/mac-binhex40",
	"hta": "application/hta",
	"htc": "text/x-component",
	"htm": "text/html",
	"html": "text/html",
	"htt": "text/webviewhtml",
	"ico": "image/x-icon",
	"ief": "image/ief",
	"iii": "application/x-iphone",
	"ins": "application/x-internet-signup",
	"isp": "application/x-internet-signup",
	"jfif": "image/pipeg",
	"jpe": "image/jpeg",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "application/x-javascript",
	"latex": "application/x-latex",
	"lha": "application/octet-stream",
	"lsf": "video/x-la-asf",
	"lsx": "video/x-la-asf",
	"lzh": "application/octet-stream",
	"m13": "application/x-msmediaview",
	"m14": "application/x-msmediaview",
	"m3u": "audio/x-mpegurl",
	"man": "application/x-troff-man",
	"mdb": "application/x-msaccess",
	"me": "application/x-troff-me",
	"mht": "message/rfc822",
	"mhtml": "message/rfc822",
	"mid": "audio/mid",
	"mny": "application/x-msmoney",
	"mov": "video/quicktime",
	"movie": "video/x-sgi-movie",
	"mp2": "video/mpeg",
	"mp3": "audio/mpeg",
	"mpa": "video/mpeg",
	"mpe": "video/mpeg",
	"mpeg": "video/mpeg",
	"mpg": "video/mpeg",
	"mpp": "application/vnd.ms-project",
	"mpv2": "video/mpeg",
	"ms": "application/x-troff-ms",
	"mvb": "application/x-msmediaview",
	"nws": "message/rfc822",
	"oda": "application/oda",
	"p10": "application/pkcs10",
	"p12": "application/x-pkcs12",
	"p7b": "application/x-pkcs7-certificates",
	"p7c": "application/x-pkcs7-mime",
	"p7m": "application/x-pkcs7-mime",
	"p7r": "application/x-pkcs7-certreqresp",
	"p7s": "application/x-pkcs7-signature",
	"pbm": "image/x-portable-bitmap",
	"pdf": "application/pdf",
	"pfx": "application/x-pkcs12",
	"pgm": "image/x-portable-graymap",
	"pko": "application/ynd.ms-pkipko",
	"pma": "application/x-perfmon",
	"pmc": "application/x-perfmon",
	"pml": "application/x-perfmon",
	"pmr": "application/x-perfmon",
	"pmw": "application/x-perfmon",
	"pnm": "image/x-portable-anymap",
	"pot,": "application/vnd.ms-powerpoint",
	"ppm": "image/x-portable-pixmap",
	"pps": "application/vnd.ms-powerpoint",
	"ppt": "application/vnd.ms-powerpoint",
	"prf": "application/pics-rules",
	"ps": "application/postscript",
	"pub": "application/x-mspublisher",
	"qt": "video/quicktime",
	"ra": "audio/x-pn-realaudio",
	"ram": "audio/x-pn-realaudio",
	"ras": "image/x-cmu-raster",
	"rgb": "image/x-rgb",
	"rmi": "audio/mid",
	"roff": "application/x-troff",
	"rtf": "application/rtf",
	"rtx": "text/richtext",
	"scd": "application/x-msschedule",
	"sct": "text/scriptlet",
	"setpay": "application/set-payment-initiation",
	"setreg": "application/set-registration-initiation",
	"sh": "application/x-sh",
	"shar": "application/x-shar",
	"sit": "application/x-stuffit",
	"snd": "audio/basic",
	"spc": "application/x-pkcs7-certificates",
	"spl": "application/futuresplash",
	"src": "application/x-wais-source",
	"sst": "application/vnd.ms-pkicertstore",
	"stl": "application/vnd.ms-pkistl",
	"stm": "text/html",
	"svg": "image/svg+xml",
	"sv4cpio": "application/x-sv4cpio",
	"sv4crc": "application/x-sv4crc",
	"swf": "application/x-shockwave-flash",
	"t": "application/x-troff",
	"tar": "application/x-tar",
	"tcl": "application/x-tcl",
	"tex": "application/x-tex",
	"texi": "application/x-texinfo",
	"texinfo": "application/x-texinfo",
	"tgz": "application/x-compressed",
	"tif": "image/tiff",
	"tiff": "image/tiff",
	"tr": "application/x-troff",
	"trm": "application/x-msterminal",
	"tsv": "text/tab-separated-values",
	"txt": "text/plain",
	"uls": "text/iuls",
	"ustar": "application/x-ustar",
	"vcf": "text/x-vcard",
	"vrml": "x-world/x-vrml",
	"wav": "audio/x-wav",
	"wcm": "application/vnd.ms-works",
	"wdb": "application/vnd.ms-works",
	"wks": "application/vnd.ms-works",
	"wmf": "application/x-msmetafile",
	"wps": "application/vnd.ms-works",
	"wri": "application/x-mswrite",
	"wrl": "x-world/x-vrml",
	"wrz": "x-world/x-vrml",
	"xaf": "x-world/x-vrml",
	"xbm": "image/x-xbitmap",
	"xla": "application/vnd.ms-excel",
	"xlc": "application/vnd.ms-excel",
	"xlm": "application/vnd.ms-excel",
	"xls": "application/vnd.ms-excel",
	"xlt": "application/vnd.ms-excel",
	"xlw": "application/vnd.ms-excel",
	"xof": "x-world/x-vrml",
	"xpm": "image/x-xpixmap",
	"xwd": "image/x-xwindowdump",
	"z": "application/x-compress",
	"zip": "application/zip"
};

function processMimeTypes() {
	navigator.mimeTypes.forEach(function(mimeType) {
		if (!mimeType.suffixes) return;
		
		var type = mimeType.type;
		mimeType.suffixes.split(',').forEach(function(suffix) {
			if (!mimeTypes.hasOwnProperty(suffix)) mimeTypes[suffix] = type;
		});
	});
}

try {
	processMimeTypes();
} catch(e) {}
