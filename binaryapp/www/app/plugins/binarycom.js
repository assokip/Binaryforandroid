function AppPlugin(app) {
    app.binarycom = {
        
        offerings : {
            
            data : null,
            
            timestamp : new Date(),
            refreshminutes : 15,
            
            get : function(o) {
                o |= {};
                var refresh = o.refresh? true:false;
                
                var d = this.timestamp.getTime();
                d.setMinutes(d.getMinutes()+this.timestamp);
                
                if (refresh || ! this.data || new Date().getTime() > d.getTime()) {
                    
                    
                    
                    
                    
                } else {
                    
                    if (o.onCompletion) o.onCompletion(this.data);
                }
            }
        }
    };   
}