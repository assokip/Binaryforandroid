module.exports = function(app) {

    app['core.events'] = new function() {
    
        var self = this;
    
        this.listeners = {
            pool : {},
            add : function(name, event, fn) {
                var pool = this.pool;
                if (! pool[name]) pool[name] = {};
                if (! pool[name][event]) pool[name][event] = new Array();
                var m = pool[name][event];
                if (m.indexOf(fn) === -1) m.push(fn);
                self.dispatch('core.events','listeners.add',{ name:name, event:event, fn:fn });
                return m[m.length-1];
            },
            remove : function(fn) {
                var s=this;
                Object.keys(s.pool).some(function(name) {
                    return Object.keys(s.pool[name]).some(function(event) {
                        var p = s.pool[name][event];
                        for (var i=0; i < p.length; i++) {
                            if (p[i] !== fn) continue;
                            self.dispatch('core.events','listeners.remove',{ name:name, event:event, fn:fn });
                            s.pool[name][event].splice(i,1);
                            return true;
                        }
                    });
                });
            }
        },
        this.dispatch = function(name, event, params, bubble) {
            if (! this.listeners.pool[name] || ! this.listeners.pool[name][event]) return;
            if (bubble !== false && name !== 'core.events' && event !== 'dispatch') this.dispatch('core.events','dispatch', { name:name, event:event, params: params});
            this.listeners.pool[name][event].forEach(function(t) { t(params); });
        }
    
    };

};