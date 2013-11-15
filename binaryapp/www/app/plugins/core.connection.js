function AppPlugin(app) {
    
    app.core.connection = {
        
        source : { def : null },
        types : {},
        pool : new Array(),
        count : function() { return this.pool.length },
        active : {
            pool : new Array(),
            count : function() { return this.pool.length },
            add : function(o) { this.pool.push(o) },
            remove : function(o) { this.pool.splice(this.pool.indexOf(o), 1); }
        },
        create : function(o) {
            if (! o) o = {};
            if (! o.type) o.type = 'xhr';
            var c = new app.core.connection.types[o.type](o);
            app.core.events.dispatch('core.connection.created',c);
            app.core.connection.pool.push(c);
            return c;
        },
        remove : function(o) {
            app.core.events.dispatch('core.connection.removed',o);
            app.core.connection.pool.splice(this.pool.indexOf(o), 1);
        },
        abort : function(o) {
            var i = app.core.connection.pool.indexOf(o);
            if (i===-1) return;
            app.core.connection.pool[i].abort();
        }
        
    };
    
};