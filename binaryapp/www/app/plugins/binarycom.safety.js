function AppPlugin(app) {
    app.binarycom.safety = {
        mode : {
            value : null,
            set : function(o) {
                this.value = o? true: false;
                app.core.events.dispatch('binarycom.safety.mode', this.value);
            },
            get : function() {
                return this.value? true : false;
            }
        }
    };   
}