function AppPlugin(app) {
    
    app.stash = {
    
        store : {},
        
        remove: function(id) { if (id in this.store) delete this.store[id]; },
        
        set : function (id, value) {
            this.store[id]=value;
        },
        
        get : function (id) {
            if (id in this.store) return this.store[id];
            return null;
        }
        
    };

};