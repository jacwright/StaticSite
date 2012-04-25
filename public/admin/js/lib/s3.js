(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define(['./date', './crypto', './promises'], function(_date_, crypto, promises) {
    var Bucket, addQueryParams, base64, hmac, key, md5, mimeTypes, processMimeTypes, s3, secret, sha1, signedHeader, toType, types, utf8, xmlToObj;
    md5 = crypto.md5, sha1 = crypto.sha1, hmac = crypto.hmac, base64 = crypto.base64, utf8 = crypto.utf8;
    key = null;
    secret = null;
    signedHeader = /^(versioning|location|acl|torrent|versionid)/;
    signedHeader.test = signedHeader.test.bind(signedHeader);
    s3 = {
      auth: function(thekey, thesecret) {
        key = thekey;
        return secret = thesecret;
      },
      bucket: function(name) {
        return new Bucket(name);
      },
      list: function() {
        return s3.load({
          method: 'get',
          url: '/'
        }).then(xmlToObj).then(function(results) {
          results.buckets = results.buckets.bucket;
          if (!(results.buckets instanceof Array)) {
            results.buckets = [results.buckets];
          }
          return results;
        });
      },
      load: function(options) {
        var amz, amzString, contentMD5, contentType, data, date, ext, headers, lowered, method, name, params, request, resource, signature, stringToSign, url, value, _ref;
        if (options == null) options = {};
        headers = options.headers || {};
        for (name in headers) {
          if (!__hasProp.call(headers, name)) continue;
          value = headers[name];
          lowered = name.toLowerCase();
          if (name !== lowered) {
            delete headers[name];
            headers[lowered] = value;
          }
        }
        method = options.method.toLowerCase() || 'get';
        url = addQueryParams(options.url, options.params);
        resource = url.split('?');
        params = resource.length > 1 ? resource.pop().split('&') : [];
        resource = addQueryParams(resource[0], params.filter(signedHeader.test));
        date = new Date().formatGMT('D, d M Y H:i:s \\G\\M\\T');
        data = options.data;
        contentType = options.contentType || '';
        contentMD5 = '';
        amz = [];
        if (contentType || (method === 'put' && data)) {
          if (!contentType) {
            ext = url.split('?').shift().replace(/^.*\./, '').toLowerCase();
            contentType = headers['content-type'] || mimeTypes[ext] || 'application/octet-stream';
          }
          headers['content-type'] = contentType;
          contentMD5 = headers['content-md5'] = base64.encrypt(md5(data, {
            asBytes: true
          }));
        }
        headers['x-amz-date'] = date;
        if (options.acl) headers['x-amz-acl'] = options.acl;
        if (options.meta) {
          _ref = options.meta;
          for (name in _ref) {
            if (!__hasProp.call(_ref, name)) continue;
            value = _ref[name];
            value = value.replace(/\n/g, ' ');
            headers['x-amz-meta-' + name.toLowerCase()] = value;
          }
        }
        for (name in headers) {
          if (!__hasProp.call(headers, name)) continue;
          value = headers[name];
          if (name.slice(0, 6) === 'x-amz-') amz.push(name + ':' + value);
        }
        if (!options.anonymous) {
          amzString = '';
          if (amz.length) amzString = amz.sort().join('\n') + '\n';
          stringToSign = [method.toUpperCase(), contentMD5, contentType, '', amzString + resource].join('\n');
          signature = base64.encrypt(hmac(sha1, utf8.encode(stringToSign), secret, {
            asBytes: true
          }));
          headers['authorization'] = 'AWS ' + key + ':' + signature;
        }
        request = {
          type: method,
          url: url,
          headers: headers,
          data: data
        };
        return promises.when($.ajax(request)).then(function(results) {
          var deferred;
          deferred = new promises.Deferred();
          setTimeout((function() {
            return deferred.fulfill(results[0]);
          }), 0);
          return deferred.promise;
        }, function(results) {
          var xhr, xml;
          xhr = results[0];
          xml = $(xhr.responseText);
          if (xml.find('code').text() === 'SignatureDoesNotMatch') {
            console.error('Signature does not match, expected:\n', xml.find('StringToSign').text().replace(/\n/g, '\\n'), '\nactual:\n', stringToSign.replace(/\n/g, '\\n'));
          }
          return new Error(xml.find('message').text());
        });
      }
    };
    Bucket = (function() {

      function Bucket(name) {
        this.name = name;
        this.url = '/' + name + '/';
      }

      Bucket.prototype.list = function(folder, options) {
        var url;
        url = this.url;
        options = $.extend(options || {}, {
          method: 'get',
          url: url
        });
        if (folder) (options.params || (options.params = {})).prefix = folder;
        return s3.load(options).then(xmlToObj).then(function(results) {
          if (results.contents instanceof Array) {
            return results.contents;
          } else if (results.contents) {
            return [results.contents];
          } else {
            return [];
          }
        });
      };

      Bucket.prototype.get = function(url, options) {
        url = this.url + url;
        options = $.extend(options || {}, {
          method: 'get',
          url: url
        });
        return s3.load(options);
      };

      Bucket.prototype.put = function(url, data, options) {
        if (options == null) options = {};
        url = this.url + url;
        options = $.extend(options, {
          method: 'put',
          url: url,
          data: data
        });
        return s3.load(options);
      };

      Bucket.prototype.copy = function(url, newUrl, options) {
        if (options == null) options = {};
        url = this.url + url;
        newUrl = this.url + newUrl;
        options = $.extend(options, {
          method: 'put',
          url: newUrl,
          headers: {
            'x-amz-copy-source': url
          }
        });
        return s3.load(options);
      };

      Bucket.prototype.destroy = function(url, options) {
        url = this.url + url;
        options = $.extend(options || {}, {
          method: 'delete',
          url: url
        });
        return s3.load(options);
      };

      return Bucket;

    })();
    addQueryParams = function(url, params) {
      var index, name, query, value, _len;
      query = params instanceof Array ? params : [];
      if (params && params !== query) {
        for (value = 0, _len = params.length; value < _len; value++) {
          name = params[value];
          query.push(name + '=' + encodeURIComponent(value));
        }
      }
      if ((index = url.indexOf('?')) !== -1) {
        query = query.concat(url.slice(index + 1).split('&'));
        url = url.slice(0, index);
      }
      if (query.length) {
        query.sort();
        url += '?' + query.join('&');
      }
      return url;
    };
    toType = function(value) {
      var match, type, _i, _len;
      if (typeof value !== 'string') return value;
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        type = types[_i];
        if ((match = value.match(type.exp))) return type.cast(match);
      }
      return value;
    };
    types = [
      {
        exp: /^true|false$/,
        cast: function(match) {
          return match === 'true';
        }
      }, {
        exp: /^[\d\.]+$/,
        cast: function(match) {
          return parseFloat(match[0]);
        }
      }, {
        exp: /^[\d\.]+$/,
        cast: function(match) {
          return parseFloat(match[0]);
        }
      }, {
        exp: /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/,
        cast: function(match) {
          return new Date(Date.UTC(match[1], parseInt(match[2]) + 1, match[3], match[4], match[5], match[6], match[7]));
        }
      }
    ];
    xmlToObj = function(node, obj) {
      var child, len, name, _i, _len, _ref;
      if (!obj) {
        node = node.firstChild;
        obj = {};
      }
      if (!node.childNodes.length) return null;
      len = node.childNodes.length;
      _ref = node.childNodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        child = _ref[_i];
        if (len === 1 && child.nodeType === 3) return child.nodeValue;
        name = child.nodeName.replace(/^[A-Z]/, function(match) {
          return match.toLowerCase();
        });
        if (node.getElementsByTagName(child.tagName).length > 1) {
          if (!obj[name]) obj[name] = [];
          obj[name].push(xmlToObj(child, {}));
        } else if (child.nodeName && child.nodeName !== '#cdata-section') {
          obj[name] = xmlToObj(child, {});
        }
      }
      return obj;
    };
    mimeTypes = {
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
    processMimeTypes = function() {
      return navigator.mimeTypes.forEach(function(mimeType) {
        var type;
        if (!mimeType.suffixes) return;
        type = mimeType.type;
        return mimeType.suffixes.split(',').forEach(function(suffix) {
          if (!mimeTypes.hasOwnProperty(suffix)) return mimeTypes[suffix] = type;
        });
      });
    };
    try {
      processMimeTypes();
    } catch (e) {

    }
    return s3;
  });

}).call(this);
