
/**
 * A basic class system which puts a nicer syntax onto the native JavaScript prototype class creation. By
 * passing an object in the constructor of Class() you may defined the methods and constructor of your new class. Two
 * special properties may be defined, constructor, extend, and implement. Set constructor to the function that will be
 * called as the constructor of your class (note, this IS your class as well). Set extend to the parent class your new
 * class is extending. Set implement to either a one class or an array of classes which will have their functionality
 * copied over onto this new classes' definition. Note that objects of your new class type will be instances of the
 * parent in extend, but not in implement.
 * 
 * Example:
 * var MyClass = new Class({
 *     extend: ParentClass,
 *     implement: ImplClass,
 *     constructor: function() {
 *         this.foo = 'bar';
 *     }
 * });
 * 
 * var obj = new MyClass();
 * alert(obj instanceof ParentClass); // true
 * alert(obj instanceof ImplClass); // false, though will have all the functions defined on ImplClass
 * alert(obj.constructor == MyClass); // true
 * 
 * @param implementation An object with the implementation of the class.
 */
function Class(def, statics) {
	if (arguments.length == 0) {
        def = {};
    }
	var implement = def.implement,
		extend = def.extend || Object,
		constructor = def.constructor || function() {parent.apply(this, arguments)};
	
    delete def.extend;
    delete def.implement;
	
	// add implement first so definition can override it
	if (implement instanceof Array) {
		for (var i = 0, l = implement.length; i < l; i++) {
			Object.defineProperties(constructor.prototype, implement[i].prototype);
		}
	} else if (implement) {
		Object.defineProperties(constructor.prototype, implement[i].prototype);
	}
	
	// Copy the properties over onto the new prototype
	constructor.prototype = Object.create(extend, def);
	
	if (statics) {
		Object.defineProperties(constructor, statics);
	}
	
	return constructor;
}

Class.convert = function(obj, type) {
	if (obj.__proto__) { // cheaper method to make an object a given type/class
		obj.__proto__ = type.prototype;
		type.call(obj);
	} else { // IE copy everything over
		var newObj = new type();
		for (var i in obj) {
			newObj[i] = obj[i];
		}
		obj = newObj;
	}
	return obj;
};

if (typeof exports !== 'undefined') {
	exports.Class = Class;
}
