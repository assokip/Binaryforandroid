function AppPlugin(app) {
    app['binarycom.charts'] = {
        types : {},
        create : function(o) {
            var c = new app['binarycom.charts'].types[o.type](o);
            app['core.events'].dispatch('binarycom.charts.created',c);
            return c;
        }
    };
};