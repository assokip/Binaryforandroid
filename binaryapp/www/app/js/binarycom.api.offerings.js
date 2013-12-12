function AppPlugin(app) {
    
    app['binarycom.api.offerings'] = new function() {
        
        var api = app['binarycom.apigee'];
        
        var root = this;
        
        this.connection = app['core.connection'].create({
            exe : api.url.get(),
            resource : '/offerings',
            headers : {
                'Authorization' : function() {
                    var a = api.status.get();
                    return a? 'Bearer '+ a.token : '';
                }
            }
        }),
        
        this.refreshminutes = 15;

        this.get = function(o) {
            if (!o) o = {};
            var cache = app['core.cache'].get('binarycom.offerings');
            if (! cache) {
                var c = root.connection;
                c.status.nextto = o.statusnextto? o.statusnextto : null;
                c.onCompletion = function(k) {
                    var dt = new Date();
                    dt.setMinutes(dt.getMinutes()+root.refreshminutes);
                    app['core.cache'].set({ id:'binarycom.offerings', value:k, expiry:dt });
                    if (o.onCompletion) o.onCompletion(k);
                }
                c.run();
            } else {
                if (o.onCompletion) o.onCompletion(cache);
            }
        };

        this.abort = function() {
            this.connection.abort();
        };
    }
}