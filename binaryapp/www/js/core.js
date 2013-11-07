App = function(o) {
    
    var _app = this;
    
    this.debug = {
	value : false,
	set : function(o) {
	    this.value = o? true: false;
	    _app.events.dispatch('debug.mode.toggled', this.value);
	},
	get : function() { return this.value; },
    };
    
    this.events = {
        listeners : {
            list : new Array(),
            add : function(event, fn) {
                if (! this.list[event]) this.list[event] = new Array();
                if (!(fn in this.list[event]) && fn instanceof Function) this.list[event].push(fn);
                if (_app.debug.get()) _app.events.dispatch('log.append','EVENTS:ADD:'+event);
            },
            remove : function(event, fn) {
                if (! this.list[event]) return;
                for (var i=0, l=this.list[event].length; i<l; i++) {
                    if (this.list[event][i] === fn) {
                        if (_app.debug.get()) _app.events.dispatch('log.append','EVENTS:REMOVE:'+event);
                        this.list[event].slice(i,1);
                        break;
                    }
                }
            }
        },
        dispatch : function(event, params) {
            if (! this.listeners.list[event]) return;
            for (var i=0, l=this.listeners.list[event].length; i<l; i++) {
                if (_app.debug.get()) _app.events.dispatch('log.append','EVENTS:DISPATCH:'+event);
                this.listeners.list[event][i].call(window, params);
            }
        }
    };
    
};
