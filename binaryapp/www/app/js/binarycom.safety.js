function AppPlugin(app) {
    app['binarycom.safety'] = new function() {
        this.mode = {
            value : null,
            set : function(o,init) {
                if (! init && ! o && ! window.confirm('You are about to disable confirmation boxes. You will not be warned before purchasing a trade.')) return;
                this.value = o? true: false;
                app['core.store'].set({ id:'binarycom.safety.mode', value:this.value });
                app['core.events'].dispatch('binarycom.safety.mode.set', this.value);
            },
            get : function() {
                return this.value? true : false;
            }
        }
    };
}

AppPluginLoaded=true;