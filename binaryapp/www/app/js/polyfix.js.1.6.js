if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {
	var T, A, k;
	if (this == null) { throw new TypeError(" this is null or not defined"); }
	var O = Object(this);
	var len = O.length >>> 0;
	if (typeof callback !== "function") throw new TypeError(callback + " is not a function");
	if (thisArg) T = thisArg;
	A = new Array(len);
	k = 0;
	while(k < len) {
		var kValue, mappedValue;
		if (k in O) {
		kValue = O[ k ];
		mappedValue = callback.call(T, kValue, k, O);
		A[k] = mappedValue;
	}
	k++;
    }
    return A;
  };      
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement , fromIndex) {
    var i, pivot = (fromIndex) ? fromIndex : 0, length;

    if (!this) throw new TypeError();
    length = this.length;
    if (length === 0 || pivot >= length) return -1;
    if (pivot < 0) pivot = length - Math.abs(pivot);

    for (i = pivot; i < length; i++) {
      if (this[i] === searchElement) return i;
    }
    return -1;
  };
}

if (!Element.prototype.getElementsByClassName) {
    var indexOf = [].indexOf || function(prop) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === prop) return i;
        }
        return -1;
    };
    getElementsByClassName = function(className,context) {
        var elems = document.querySelectorAll ? context.querySelectorAll("." + className) : (function() {
            var all = context.getElementsByTagName("*"),
                elements = [],
                i = 0;
            for (; i < all.length; i++) {
                if (all[i].className && (" " + all[i].className + " ").indexOf(" " + className + " ") > -1 && indexOf.call(elements,all[i]) === -1) elements.push(all[i]);
            }
            return elements;
        })();
        return elems;
    };
    document.getElementsByClassName = function(className) {
        return getElementsByClassName(className,document);
    };
    Element.prototype.getElementsByClassName = function(className) {
        return getElementsByClassName(className,this);
    };
};

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function (fn, scope) {
        var i, len;
        for (i = 0, len = this.length; i < len; ++i) {
            if (i in this) {
                fn.call(scope, this[i], i, this);
            }
        }
    };
}

if (!Array.prototype.unshift) {
    var array_unshift = Array.prototype.unshift;
    Array.prototype.unshift = function() {
	array_unshift.apply(this, arguments);
	return this.length;
    };
}

if (!Array.prototype.some) {
  Array.prototype.some = function(fun /*, thisp */) {
    'use strict';
    if (this == null) throw new TypeError();
    var thisp, i,
        t = Object(this),
        len = t.length >>> 0;
    if (typeof fun !== 'function') throw new TypeError();
    thisp = arguments[1];
    for (i = 0; i < len; i++) {
      if (i in t && fun.call(thisp, t[i], i, t)) return true;
    }
    return false;
  };
}

if (!Array.prototype.every) {
  Array.prototype.every = function(fun /*, thisp */) {
    'use strict';
    var t, len, i, thisp;
    if (this == null) throw new TypeError();
    t = Object(this);
    len = t.length >>> 0;
    if (typeof fun !== 'function') throw new TypeError();
    thisp = arguments[1];
    for (i = 0; i < len; i++) {
      if (i in t && !fun.call(thisp, t[i], i, t)) return false;
    }
    return true;
  };
}

AppPluginLoaded=true;
