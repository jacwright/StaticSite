
/**
 * Returns a new object that has the given `obj` as its prototype.  This method
 * can be used to get prototypal inheritance without using the `new` keyword
 * directly.
 *
 * This implementation comes from:
 * http://ejohn.org/blog/ecmascript-5-objects-and-properties/
 *
 * @function
 * @param   {Object}    obj existing object to create a descendant of
 * @returns {Object}    a new object that inherits from `obj`
 */
Object.create = Object.create || (function() {
    var defineProperty = Object.defineProperty || function(obj, name, desc) {
        if (desc.hasOwnProperty('value')) {
            obj[name] = desc.value;
        }
    };


    var defineProperties = Object.defineProperties || function(obj, props) {
        for (var name in props) {
            if (props.hasOwnProperty(name)) {
                defineProperty(obj, name, props[name]);
            }
        }
    };


    return function( proto, props ) {
        var ctor = function( ps ) {
            if ( ps ) {
                defineProperties( this, ps );
            }
        };
        ctor.prototype = proto;
        return new ctor( props );
    };
})();



if (!Function.prototype.bind) {
	Function.prototype.bind = function(obj) {
		var slice = Array.prototype.slice,
			args = slice.call(arguments, 1), 
			self = this, 
			nop = function () {}, 
			bound = function () {
				return self.apply(this instanceof nop ? this : (obj || {}), args.concat(slice.call(arguments)));    
			};
		nop.prototype = self.prototype;
		bound.prototype = new nop();
		return bound;
	};
}


(function() {
	
	var proto = Array.prototype;
	if (!proto.forEach) proto.forEach = function(fn, thisObj) {
		var scope = thisObj || window;
		for (var i = 0, j = this.length; i < j; ++i) {
			fn.call(scope, this[i], i, this);
		}
	};
	if (!proto.every) proto.every = function(fn, thisObj) {
		var scope = thisObj || window;
		for (var i = 0, j = this.length; i < j; ++i) {
			if (!fn.call(scope, this[i], i, this)) {
				return false;
			}
		}
		return true;
	};
	if (!proto.some) proto.some = function(fn, thisObj) {
		var scope = thisObj || window;
		for (var i = 0, j = this.length; i < j; ++i) {
			if (fn.call(scope, this[i], i, this)) {
				return true;
			}
		}
		return false;
	};
	if (!proto.map) proto.map = function(fn, thisObj) {
		var scope = thisObj || window;
		var a = [];
		for (var i = 0, j = this.length; i < j; ++i) {
			a.push(fn.call(scope, this[i], i, this));
		}
		return a;
	};
	if (!proto.filter) proto.filter = function(fn, thisObj) {
		var scope = thisObj || window;
		var a = [];
		for (var i = 0, j = this.length; i < j; ++i) {
			if (fn.call(scope, this[i], i, this)) a.push(this[i]);
		}
		return a;
	};
	if (!proto.indexOf) proto.indexOf = function(el, start) {
		start = start || 0;
		for (var i = start, j = this.length; i < j; ++i) {
			if (this[i] === el) {
				return i;
			}
		}
		return -1;
	};
	if (!proto.lastIndexOf) proto.lastIndexOf = function(el, start) {
		start = start !== undefined ? start : this.length;
		if (start >= this.length) {
			start = this.length;
		}
		if (start < 0) {
			start = this.length + start;
		}
		for (var i = start; i >= 0; --i) {
			if (this[i] === el) {
				return i;
			}
		}
		return -1;
	};
	if (!proto.reduce) proto.reduce = function(fn /*, initialValue */) {
		if (this === void 0 || this === null) throw new TypeError();
		
		var arr = Object(this);
		var len = arr.length >>> 0;
		if (typeof fn !== "function") throw new TypeError();
		
		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1) throw new TypeError();
		
		var k = 0;
		var accumulator;
		if (arguments.length >= 2) {
			accumulator = arguments[1];
		} else {
			do {
				if (k in arr) {
					accumulator = arr[k++];
					break;
				}
				
				// if array contains no values, no initial value to return
				if (++k >= len) throw new TypeError();
			} while (true);
		}
		
		while (k < len) {
			if (k in arr)
				accumulator = fn.call(undefined, accumulator, arr[k], k, arr);
			k++;
		}
		
		return accumulator;
	};
	if (!proto.reduceRight) proto.reduceRight = function(fn /*, initialValue */) {
		if (this === void 0 || this === null) throw new TypeError();
		
		var arr = Object(this);
		var len = arr.length >>> 0;
		if (typeof fn !== "function") throw new TypeError();
		
		// no value to return if no initial value and an empty array
		if (len == 0 && arguments.length == 1) throw new TypeError();
		
		var k = arr.length - 1;
		var accumulator;
		if (arguments.length >= 2) {
			accumulator = arguments[1];
		} else {
			do {
				if (k in arr) {
					accumulator = arr[k--];
					break;
				}
				
				// if array contains no values, no initial value to return
				if (--k < 0) throw new TypeError();
			} while (true);
		}
		
		while (k >= 0) {
			if (k in arr)
				accumulator = fn.call(undefined, accumulator, arr[k], k, arr);
			k--;
		}
		
		return accumulator;
	};
	
	if (!Function.prototype.bind) Function.prototype.bind = function( obj ) {
		var slice = [].slice,
			args = slice.call(arguments, 1), 
			self = this, 
			nop = function () {}, 
			bound = function () {
				return self.apply( this instanceof nop ? this : ( obj || {} ), 
				args.concat( slice.call(arguments) ) );    
			};
		
		nop.prototype = self.prototype;
		bound.prototype = new nop();
		return bound;
	};
})();