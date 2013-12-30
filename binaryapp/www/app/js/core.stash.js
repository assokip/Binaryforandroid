module.exports = function(app) {

    app['core.stash'] = {
    
        store : {},
        
        remove: function(name, id) { if (this.store[name] && this.store[name][id]) this.store[name][id] = null; },
        
        set : function (name,id,value) {
            if (! this.store[name]) this.store[name] = {};
            this.store[name][id]=value;
            app['core.events'].dispatch('core.cache','set', { name:name, id:id, value:value });
        },
        
        get : function (name, id) {
            if (this.store[name] && this.store[name][id]) return this.store[name][id];
            return null;
        }
    };

};