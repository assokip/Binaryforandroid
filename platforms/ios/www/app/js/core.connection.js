function AppPlugin(app) {
    
    app['core.connection'] = new function() {
        
        var self = this;

        this.source = {
            def : {
                value:null,
                set : function(o) { this.value=o; },
                get : function() { return self.value; }
            }
        },
        this.types = {},
        this.pool = new Array(),
        this.count = function() { return self.pool.length },
        this.active = {
            pool : new Array(),
            count : function() { return self.pool.length },
            add : function(o) { self.pool.push(o) },
            remove : function(o) { self.pool.splice(self.pool.indexOf(o), 1); }
        },
        this.create = function(o) {
            if (! o) o = {};
            if (! o.type) o.type = 'xhr';
            var c = new self.types[o.type](o);
            app['core.events'].dispatch('core.connection.created',c);
            self.pool.push(c);
            return c;
        },
        this.remove = function(o) {
            app['core.events'].dispatch('core.connection.removed',o);
            self.pool.splice(self.pool.indexOf(o), 1);
        },
        this.abort = function(o) {
            var i = self.pool.indexOf(o);
            if (i===-1) return;
            self.pool[i].abort();
        }
        
    };
    
};

AppPluginLoaded=true;