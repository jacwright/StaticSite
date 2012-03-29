(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  define(['lib/backbone'], function(backbone) {
    var become, get, helpers, linkify, module;
    module = {};
    module.get = get = function(templateFunction, data, opts) {
      var elem, html;
      if (data == null) data = {};
      if (opts == null) opts = {};
      if (data instanceof Array || (Backbone && data instanceof Backbone.Collection)) {
        if (opts.textOnly) {
          elem = data.map(function(data, index) {
            opts.index = index;
            return get(file, data, opts);
          });
          return elem.join('');
        } else {
          elem = [];
          data.forEach(function(data, index) {
            opts.index = index;
            return elem.push(get(file, data, opts).detach().get().pop());
          });
          return $(elem);
        }
      } else {
        html = templateFunction(data, opts.index);
        if (opts.textOnly) return html;
        elem = $(html).data('model', data);
        elem.find('[data-template][data-data]').each(function() {
          var propertyName, sub;
          sub = $(this);
          propertyName = sub.attr('data-data').replace(/^[^.]+\./, '');
          if (data[propertyName]) {
            return get(sub.attr('data-template', data[propertyName])).appendTo(sub);
          }
        });
        if (Backbone && data instanceof Backbone.Model && !opts.unbound) {
          data.bind('change', function() {
            return elem = elem.replaceSilently(templateFunction(data, opts.index));
          });
        }
        return elem;
      }
    };
    $.fn.replaceSilently = function(elem) {
      var source, target;
      elem = $(elem);
      source = this[0];
      target = elem[0];
      source.parentNode.replaceChild(target, source);
      become(source, target);
      return elem;
    };
    become = function(source, target) {
      var info, internals, type, _ref, _results;
      target[$.expando] = source[$.expando];
      internals = $.hasData(target) && $(target).data()[$.expando];
      if (internals && internals.events && internals.handle) {
        _ref = internals.events;
        _results = [];
        for (type in _ref) {
          info = _ref[type];
          if (target.addEventListener) {
            _results.push(target.addEventListener(type, internals.handle, false));
          } else {
            _results.push(target.attachEvent("on", type, internals.handle));
          }
        }
        return _results;
      }
    };
    module.helpers = helpers = {
      escape: function(value) {
        value = String(value != null ? value : '');
        return value.replace(/&(?!\w+;)|["<>\\]/g, function(s) {
          switch (s) {
            case "&":
              return "&amp;";
            case '"':
              return '&quot;';
            case "<":
              return "&lt;";
            case ">":
              return "&gt;";
            default:
              return s;
          }
        });
      }
    };
    helpers.linkify = linkify = function(text) {
      var name, type;
      for (name in linkify) {
        if (!__hasProp.call(linkify, name)) continue;
        type = linkify[name];
        text = text.replace(type.regex, type.replace);
      }
      return text;
    };
    linkify.urls = {
      regex: /(^|\s)(http(s)?:\/\/[^\s]+)/g,
      replace: '$1<a href="$2" class="link" target="_blank">$2</a>'
    };
    linkify.twitter = {
      regex: /(^|\s)@(\w+)/g,
      replace: '$1<a href="http://twitter.com/$2" class="twitter-link" target="_blank">@$2</a>'
    };
    linkify.hash = {
      regex: /(^|\s)#(\w+)/g,
      replace: '$1<a href="http://twitter.com/#search?q=%23$2" class="hash-link" target="_blank">#$2</a>'
    };
    return module;
  });

}).call(this);
