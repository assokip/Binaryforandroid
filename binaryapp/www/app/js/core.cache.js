module.exports = function(app) {

    app['core.cache'] = {
        mode : {
            value : true,
            set : function(o) {
                this.value = o? true: false;
                app['core.events'].dispatch('core.cache','mode.set', this.value);
            },
            get : function() {
                return this.value? true : false;
            },
        },
        
        get : function(p) {
            if (! this.mode.value) return null;
            var v = app['core.store'].get('core.cache','data:'+p);
            if (! v) return null;
            if (v.expiry && v.expiry < new Date().getTime()) {
                this.set({ id:'core.cache.'+p });
                return null;
            }
            return v.data;
        },
        
        set : function(o) {
            if (! this.mode.value || ! o.value) o.value=null;
            var t = o.expiry? o.expiry.getTime() : null;
            app['core.store'].set('core.cache','data:'+o.id, { expiry:t, data:o.value });
            app['core.events'].dispatch('core.cache','set', o);
        }
    };

};

