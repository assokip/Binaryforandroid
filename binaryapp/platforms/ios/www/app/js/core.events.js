function AppPlugin(app) {
    
    app['core.events'] = new function() {
        
        var self = this;
        
        this.listeners = {
            pool : {},
            add : function(event, fn) {
                var pool = this.pool;
                if (! pool[event]) pool[event] = new Array();
                var m = pool[event];
                var e = null;
                if (!(fn in m)) e = m.push(fn);
                self.dispatch('core.events.listeners.add',{ event:event, fn:fn });
                return m[m.length-1];
            },
            remove : function(fn) {
                var pool = this.pool;
                Object.keys(pool).forEach(function(event) {
                    var m = pool[event];
                    for (var i=0; i < m.length; i++) {
                        if (m[i] !== fn) continue;
                        self.dispatch('core.events.listeners.remove',{ event:event, fn:fn });
                        m.slice(i,1);
                    }
                });
                if (! pool[event]) return;
            }
        },
        this.dispatch = function(event, params, bubble) {
            var m = this.listeners.pool[event];
            if (! m) return;
            if (bubble !== false && event !== 'core.events.dispatch') this.dispatch('core.events.dispatch', { event:event });
            m.forEach(function(t) { t.call(window, params); });
        }
        
    }
    
}

AppPluginLoaded=true;