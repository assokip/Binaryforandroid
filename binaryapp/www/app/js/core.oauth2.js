function AppPlugin(app) {
	
	var oauth2 = function(o) {
            
            var self = this;
            
            this.devid = o.devid;
            this.scope = o.scope;
            this.into = o.into? o.into : null,
           
            this.stage1 = {
                    exec : function() {
                            var s = o.stages[0];
                            var url = s.url({ scope: o.scope, devid: o.devid });
                            app['core.events'].dispatch('core.oauth2.login.request', { url:url });
                            if (typeof o.into === 'object') {
                               o.into.src = url;
                            } else if (! o.into) {
                                self.into = window.open(url, '_blank', 'location=no,menubar=no;directories=no;location=no;modal=yes');
                                if (o.onWindowCreate) o.onWindowCreate();
                            } else {
                                self.into.location.href = url;
                            }
                            if (s.onLoad) s.onLoad();
                    }
            },
            
            this.stage2 = {
                    exec : function(b) {
                            var s = o.stages[1];
                            var connection = new app['core.connection'].create({
                                exe: s.url({ scope: o.scope, devid: o.devid, code:b.code }),
                                onCompletion : function(j) {
                                    s.onCompletion(j);
                                    app['core.events'].dispatch('core.oauth2.token.issued',j);
                                }
                            }).run();
                            if (s.onLoad) s.onLoad();
                    }
            }
	};
	
	app['core.oauth2'] = {
		create : function(o) {
			return new oauth2(o);
		}
	}
};

AppPluginLoaded=true;