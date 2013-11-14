// adds object.keys from Javascript 1.8.5
if (!Object.keys) {
  Object.keys = (function () {
    'use strict';
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      var result = [], prop, i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}

// adds bind
if (!Function.prototype.bind) {
  Function.prototype.bind = function() { 
    var fn = this, args = Array.prototype.slice.call(arguments),
        object = args.shift(); 
	return function() { 
		return fn.apply(object, args.concat(Array.prototype.slice.call(arguments))); 
	}; 
    };
}

//adds Array.unshift from Javascript 1.6
if ([].unshift(0) != 1) {
	var array_unshift = Array.prototype.unshift;
	Array.prototype.unshift = function() {
		array_unshift.apply(this, arguments);
		return this.length;
	};
}

// adds String.trim() from JavaScript 1.8.1
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
  };
}

// adds Array.forEach() from JavaScript 1.6
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

// adds Array.map() from JavaScript 1.6
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

// adds getElementsByClassName from JavaScript 1.6
(function() {
	if (document.getElementsByClassName) return;
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
})();

// adds addEventListener and related
(function (polyfill) {
	function Event() { [polyfill] }
	Event.prototype.preventDefault = function () {
		this.nativeEvent.returnValue = false;
	};
	Event.prototype.stopPropagation = function () {
		this.nativeEvent.cancelBubble = true;
	};
	function addEventListener(type, listener, useCapture) {
		useCapture = !!useCapture;
		var cite = this;
		cite.__eventListener = cite.__eventListener || {};
		cite.__eventListener[type] = cite.__eventListener[type] || [[],[]];
		if (!cite.__eventListener[type][0].length && !cite.__eventListener[type][1].length) {
			cite.__eventListener['on' + type] = function (nativeEvent) {
				var newEvent = new Event, newNodeList = [], node = nativeEvent.srcElement || cite, property;
				for (property in nativeEvent) {
					newEvent[property] = nativeEvent[property];
				}
				newEvent.currentTarget =  cite;
				newEvent.pageX = nativeEvent.clientX + document.documentElement.scrollLeft;
				newEvent.pageY = nativeEvent.clientY + document.documentElement.scrollTop;
				newEvent.target = node;
				newEvent.timeStamp = +new Date;
				newEvent.nativeEvent = nativeEvent;
				while (node) {
					newNodeList.unshift(node);
 
					node = node.parentNode;
				}
				for (var a, i = 0; (a = newNodeList[i]); ++i) {
					if (a.__eventListener && a.__eventListener[type]) {
						for (var aa, ii = 0; (aa = a.__eventListener[type][0][ii]); ++ii) {
							aa.call(cite, newEvent);
						}
					}
				}
				newNodeList.reverse();
				for (var a, i = 0; (a = newNodeList[i]) && !nativeEvent.cancelBubble; ++i) {
					if (a.__eventListener && a.__eventListener[type]) {
						for (var aa, ii = 0; (aa = a.__eventListener[type][1][ii]) && !nativeEvent.cancelBubble; ++ii) {
							aa.call(cite, newEvent);
						}
					}
				}
				nativeEvent.cancelBubble = true;
			};
			cite.attachEvent('on' + type, cite.__eventListener['on' + type]);
		}
		cite.__eventListener[type][useCapture ? 0 : 1].push(listener);
	}
	function removeEventListener(type, listener, useCapture) {
		useCapture = !!useCapture;
		var cite = this, a;
		cite.__eventListener = cite.__eventListener || {};
		cite.__eventListener[type] = cite.__eventListener[type] || [[],[]];
		a = cite.__eventListener[type][useCapture ? 0 : 1];
		for (eventIndex = a.length - 1, eventLength = -1; eventIndex > eventLength; --eventIndex) {
			if (a[eventIndex] == listener) {
				a.splice(eventIndex, 1)[0][1];
			}
		}
		if (!cite.__eventListener[type][0].length && !cite.__eventListener[type][1].length) {
			cite.detachEvent('on' + type, cite.__eventListener['on' + type]);
		}
	}
	window.constructor.prototype.addEventListener = document.constructor.prototype.addEventListener = Element.prototype.addEventListener = addEventListener;
	window.constructor.prototype.removeEventListener = document.constructor.prototype.removeEventListener = Element.prototype.removeEventListener = removeEventListener;
})();