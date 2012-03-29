(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __slice = Array.prototype.slice;

  define(function() {
    var Deferred, Promise, args, finish, notify, promiseWhen, promiseWhenAll;
    Promise = (function() {

      function Promise() {
        this.when = __bind(this.when, this);
        this.call = __bind(this.call, this);
      }

      Promise.prototype.then = function(fulfilledHandler, failedHandler, progressHandler, cancelHandler) {
        throw new TypeError('The Promise base class is abstract, this function is overwritten by the promise\'s deferred object');
      };

      Promise.prototype.fulfilled = function(handler) {
        return this.then(handler);
      };

      Promise.prototype.failed = function(handler) {
        return this.then(null, handler);
      };

      Promise.prototype.finished = function(handler) {
        return this.then(handler, handler);
      };

      Promise.prototype.progress = function(handler) {
        return this.then(null, null, handler);
      };

      Promise.prototype.canceled = function(handler) {
        return this.then(null, null, null, handler);
      };

      Promise.prototype.apply = function(handler, context) {
        return this.then(function(result) {
          if ((result instanceof Array)(handler.apply(context, result))) {} else {
            return handler.call(context, result);
          }
        });
      };

      Promise.prototype.cancel = function() {
        var _ref;
        return (_ref = this.prev) != null ? _ref.cancel() : void 0;
      };

      Promise.prototype.get = function(propertyName) {
        return this.then(function(object) {
          return object[propertyName];
        });
      };

      Promise.prototype.set = function(propertyName, value) {
        return this.then(function(object) {
          object[propertyName] = value;
          return object;
        });
      };

      Promise.prototype.put = function(propertyName, value) {
        return this.then(function(object) {
          return object[propertyName] = value;
        });
      };

      Promise.prototype.run = function() {
        var functionName, params;
        functionName = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.then(function(object) {
          object[functionName].apply(object, params);
          return object;
        });
      };

      Promise.prototype.call = function() {
        var functionName, params;
        functionName = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.then(function(object) {
          return object[functionName].apply(object, params);
        });
      };

      Promise.prototype.when = function() {
        var functionName, params;
        functionName = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        return this.then(function(array) {
          return promiseWhenAll(array.map(function(object) {
            return object[functionName].apply(object, params);
          }));
        });
      };

      return Promise;

    })();
    ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift', 'filter', 'forEach', 'every', 'map', 'some'].forEach(function(method) {
      return Promise.prototype[method] = function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return this.then(function(object) {
          var result;
          if (object instanceof Array) result = object[method].apply(object, args);
          return result != null ? result : object;
        });
      };
    });
    promiseWhen = function() {
      var count, createCallback, deferred, failed, failedCallback, finishedCallback, fulfilledCallback, name, obj, params, _len;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      deferred = new Deferred;
      count = params.length;
      failed = false;
      fulfilledCallback = function() {};
      failedCallback = function(value) {
        failed = true;
        return value;
      };
      createCallback = function(index) {
        return function() {
          var results;
          results = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          params[index] = results.length > 1 ? results : results[0];
          if (--count === 0) {
            if (failed) {
              return deferred.fail.apply(deferred, params);
            } else {
              return deferred.fulfill.apply(deferred, params);
            }
          }
        };
      };
      for (name = 0, _len = params.length; name < _len; name++) {
        obj = params[name];
        if (obj && typeof obj.then === 'function') {
          finishedCallback = createCallback(name);
          obj.then(fulfilledCallback, failedCallback);
          obj.then(finishedCallback, finishedCallback);
        } else {
          --count;
        }
      }
      if (count === 0) deferred.fulfill.apply(deferred, params);
      return deferred.promise;
    };
    promiseWhenAll = function(promises) {
      var deferred;
      deferred = new Deferred;
      promiseWhen.apply(null, promises).then(function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return deferred.fulfill(args);
      }, function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return deferred.fail(args);
      });
      return deferred.promise;
    };
    args = function() {
      var params;
      params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      params.isArgs = true;
      return params;
    };
    Deferred = (function() {

      function Deferred(promise) {
        var cancel,
          _this = this;
        if (promise == null) promise = new Deferred.Promise;
        this.progress = __bind(this.progress, this);
        this.cancel = __bind(this.cancel, this);
        this.fail = __bind(this.fail, this);
        this.fulfill = __bind(this.fulfill, this);
        this.then = __bind(this.then, this);
        this.promise = promise;
        this.status = 'unfulfilled';
        this.progressHandlers = [];
        this.handlers = [];
        cancel = promise.cancel;
        promise.cancel = function() {
          var params;
          params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _this.status = 'canceled';
          return cancel.apply(promise, params);
        };
        promise.then = this.then;
      }

      Deferred.prototype.then = function(fulfilledHandler, failedHandler, progressHandler, canceledHandler) {
        var handler, nextDeferred;
        if (progressHandler) this.progressHandlers.push(progressHandler);
        nextDeferred = new Deferred;
        nextDeferred.promise.prev = this.promise;
        handler = {
          fulfilled: fulfilledHandler,
          failed: failedHandler,
          nextDeferred: nextDeferred,
          canceled: canceledHandler
        };
        if (this.finished()) {
          notify.call(this, handler);
        } else {
          this.handlers.push(handler);
        }
        return nextDeferred.promise;
      };

      Deferred.prototype.finished = function() {
        return this.status !== 'unfulfilled';
      };

      Deferred.prototype.fulfill = function() {
        var params, _ref;
        params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        if ((_ref = params[0]) != null ? _ref.isArgs : void 0) params = params[0];
        return finish.call(this, 'fulfilled', params);
      };

      Deferred.prototype.fail = function() {
        var params;
        params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return finish.call(this, 'failed', params);
      };

      Deferred.prototype.cancel = function() {
        var params;
        params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return finish.call(this, 'canceled', params);
      };

      Deferred.prototype.progress = function(params) {
        var progress, _i, _len, _ref, _results;
        _ref = this.progressHandlers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          progress = _ref[_i];
          _results.push(progress.apply(null, params));
        }
        return _results;
      };

      Deferred.prototype.timeout = function(milliseconds, error) {
        var _this = this;
        clearTimeout(this._timeout);
        return this._timeout = setTimeout(function() {
          return _this.fail(error != null ? error : new Error('Operation timed out'));
        }, milliseconds);
      };

      Deferred.prototype.reset = function() {
        this.status = 'unfulfilled';
        this.progressHandlers = [];
        return this.handlers = [];
      };

      return Deferred;

    })();
    finish = function(status, results) {
      var handler, _i, _len, _ref, _results;
      if (this.status !== 'unfulfilled') return;
      clearTimeout(this._timeout);
      this.status = status;
      this.results = results;
      _ref = this.handlers;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        handler = _ref[_i];
        _results.push(notify.call(this, handler));
      }
      return _results;
    };
    notify = function(handler) {
      var deferred, method, nextResult, results;
      results = this.results;
      method = handler[this.status];
      deferred = handler.nextDeferred;
      if (!method) {
        deferred[this.status.slice(0, -2)].apply(deferred, results);
        return;
      }
      nextResult = method.apply(null, results);
      if (nextResult && typeof nextResult.then === 'function') {
        nextResult.then(deferred.fulfill, deferred.fail);
      } else if (nextResult instanceof Error) {
        deferred.fail(nextResult);
      } else if (nextResult === void 0) {
        deferred[this.status.slice(0, -2)].apply(deferred, results);
      } else {
        deferred.fulfill(nextResult);
      }
      return;
    };
    Deferred.Promise = Promise;
    if (!Function.prototype.bind) {
      Function.prototype.bind = function() {
        var bound, nop, obj, params, self;
        obj = arguments[0], params = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        self = this;
        nop = function() {};
        bound = function() {
          var localParams, _ref;
          localParams = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          return self.apply((_ref = this instanceof nop) != null ? _ref : {
            "this": obj != null ? obj : {}
          }, params.concat(localParams));
        };
        nop.prototype = self.prototype;
        bound.prototype = new nop();
        return bound;
      };
    }
    return {
      Deferred: Deferred,
      Promise: Promise,
      args: args,
      when: promiseWhen,
      whenAll: promiseWhenAll,
      wrap: function(method, promise) {
        return function() {
          var args, callback, deferred;
          args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          deferred = new Deferred(promise);
          if (typeof args[args.length - 1] === 'function') callback = args.pop();
          args.push(function() {
            var err, results;
            err = arguments[0], results = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
            if (callback) {
              callback.apply(null, [err].concat(__slice.call(results)));
            }
            if (err) {
              return deferred.fail(err);
            } else {
              return deferred.fulfill.apply(deferred, results);
            }
          });
          method.apply(this, args);
          return deferred.promise;
        };
      },
      fulfilled: function(result, promise) {
        var deferred;
        deferred = new Deferred(promise);
        deferred.fulfill(result);
        return deferred.promise;
      },
      failed: function(err, promise) {
        var deferred;
        deferred = new Deferred(promise);
        deferred.fail(err);
        return deferred.promise;
      }
    };
  });

}).call(this);
