function AppPlugin(app) {
    
     app.debug = {
	value : false,
	set : function(o) {
	    this.value = o? true: false;
	    app.events.dispatch('debug.mode.toggled', this.value);
	},
	get : function() { return this.value; },
    };   
    
}