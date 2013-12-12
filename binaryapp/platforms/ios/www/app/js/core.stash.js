function AppPlugin(app) {
    
    app.core.stash = {
    
        store : {},
        
        remove: function(id) { if (id in this.store) delete this.store[id]; },
        
        set : function (id, value) {
            this.store[id]=value;
            app.core.events.dispatch('core.cache.set', { id:id, value:value });
        },
        
        get : function (id) {
            if (id in this.store) return this.store[id];
            return null;
        }
        
    };

};