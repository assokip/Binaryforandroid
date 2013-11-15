function AppPlugin(app) {
    
    app.core.events = {
        listeners : {
            list : new Object(),
            add : function(event, fn) {
                if (! this.list[event]) this.list[event] = new Array();
                if (!(fn in this.list[event]) && fn instanceof Function) this.list[event].push(fn);
                if (app.core.debug.mode.get()) app.core.events.dispatch('core.log.append','EVENTS:ADD:'+event);
            },
            remove : function(event, fn) {
                if (! this.list[event]) return;
                for (var i=0, l=this.list[event].length; i<l; i++) {
                    if (this.list[event][i] === fn) {
                        if (app.core.debug.mode.get()) app.core.events.dispatch('core.log.append','EVENTS:REMOVE:'+event);
                        this.list[event].slice(i,1);
                        break;
                    }
                }
            }
        },
        dispatch : function(event, params) {
            if (! this.listeners.list[event]) return;
            for (var i=0, l=this.listeners.list[event].length; i<l; i++) {
                if (event !== 'core.log.append' && app.core.debug.mode.get()) app.core.events.dispatch('core.log.append','EVENTS:DISPATCH:'+event);
                this.listeners.list[event][i].call(window, params);
            }
        }
    };

}