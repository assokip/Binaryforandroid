function AppPlugin(app) {
    app.binarycom.product = {
        connection : new app.core.connection.create(),
        refreshminutes : 15,
        get : function(o) {
            if (!o) o = {};
            var cache = app.core.cache.get('binarycom.product');
            if (! cache) {
                var self = this;
                var c = this.connection;
                c.headers.set('Authorization', function() {
                    var a = app.core.stash.get('apigee.oauth2');
                    return a? 'Bearer '+ a.token : '';
                });
                c.resource = '/offerings';
                c.status.nextto = o.statusnextto? o.statusnextto : null;
                c.onCompletion = function(k) {
                    var dt = new Date();
                    dt.setMinutes(dt.getMinutes()+self.refreshminutes);
                    app.core.cache.set({ id:'binarycom.product', value:k, expiry:dt });
                    if (o.onCompletion) o.onCompletion(k);
                }
                c.run();
            } else {
                if (o.onCompletion) o.onCompletion(cache);
            }
        }
    };   
}