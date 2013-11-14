function AppPlugin(app) {
     app.debug = {
	value : null,
	set : function(o) {
	    this.value = o? true: false;
	    app.events.dispatch('core.debug.mode.toggled', this.value);
	},
	get : function() {
          return this.value? true : false;
        },
    };   
    
}