function AppPlugin(app) {
    app.binarycom.safety = {
        mode : {
            value : null,
            set : function(o) {
                this.value = o? true: false;
                app.core.store.set({ id:'binarycom.safety.mode', value:o });
                app.core.events.dispatch('binarycom.safety.mode.set', this.value);
            },
            get : function() {
                return this.value? true : false;
            }
        }
    };
}