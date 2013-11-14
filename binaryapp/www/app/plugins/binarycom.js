function AppPlugin(app) {
    app.binarycom = {
        
        product : {
            
            data : null,
            connection : new app.connection.create(),
            timestamp : new Date(),
            refreshminutes : 15,
            
            get : function(o) {
                if (!o) o = {};
                var d = this.timestamp;
                d.setMinutes(d.getMinutes()+this.refreshminutes);
                
                if (o.refresh || ! this.data || new Date().getTime() > d.getTime()) {
                    var self = this;
                    var c = this.connection;
		    c.headers.set('Authorization', function() {
			var a = app.stash.get('apigee.oauth2');
			return a? 'Bearer '+ a.token : '';
		    });
                    c.resource = '/offerings';
                    c.status.nextto = o.statusnextto? o.statusnextto : null;
                    c.onCompletion = function(k) {
                        self.timestamp = new Date();
                        self.data = k;
                        if (o.onCompletion) o.onCompletion();
                    }
                    c.run();
                } else {
                    if (o.onCompletion) o.onCompletion();
                }
            }
            
        }
    };   
}