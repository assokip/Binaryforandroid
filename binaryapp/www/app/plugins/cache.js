function AppPlugin(app) {
     app.cache = {
          mode : {
               value : true,
               set : function(o) {
                   this.value = o? true: false;
                   app.events.dispatch('core.cache.mode.toggled', this.value);
               },
               get : function() {
                 return this.value? true : false;
               },
          },
          
          get : function(p) {
               if (! this.mode.value) return null;
               return app.store.get({ id:'core.cache.'+p, type:'local' });
          },
          
          set : function(o) {
               if (! this.mode.value) o.value=null;
               app.store.set({ id:'core.cache.'+o.id, type:'local', value:o.value });
          }
    };   
}