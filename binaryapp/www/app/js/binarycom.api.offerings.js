module.exports = function (app) {

    app['binarycom.api.offerings'] = new function() {
        
        var api = app['binarycom.apigee'];
        
        var root = this;
        
        this.connection = new app['core.connection.xhr']({
            exe : api.url.get(),
            resource : '/offerings',
            withCredentials : true,
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
                c.onAbort = function() { if (o.onAbort) o.onAbort(); }
                c.onError = function(e) { if (o.onError) o.onError(e); }
                c.onEnd = function() { if (o.onEnd) o.onEnd(); }
                c.onCompletion = function(k) {
                    var dt = new Date();
                    dt.setMinutes(dt.getMinutes()+root.refreshminutes);
                    app['core.cache'].set({ id:'binarycom.offerings', value:k, expiry:dt });
                    if (o.onCompletion) o.onCompletion(k);
                }
                c.run();
            } else {
                if (o.onCompletion) o.onCompletion(cache);
                if (o.onEnd) o.onEnd();
            }
        };

        this.abort = function() {
            this.connection.abort();
        };
    }

};