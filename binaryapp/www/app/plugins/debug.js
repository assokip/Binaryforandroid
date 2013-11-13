function AppPlugin(app) {
     app.debug = {
	value : null,
	set : function(o) {
	    this.value = o? true: false;
            if (app.cookie) app.cookie.set('app.debug', o? 1:0);
	    app.events.dispatch('debug.mode.toggled', this.value);
	},
	get : function() {
          if (app.cookie && this.value === null) this.value = app.cookie.get('app.debug') === '1'? true:false;
          return this.value? true : false;
        },
    };   
    
}