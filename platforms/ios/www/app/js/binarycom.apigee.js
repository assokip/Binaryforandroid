function AppPlugin(app) {

	var cordova = app['core.cordova'] && app['core.cordova'].loaded? true:false;
    
    var url = 'https://rmg-prod.apigee.net/v1/binary'; // 'http://www.binary.com/clientapp/proxy';
    var into = cordova? null : document.createElement('iframe');
    var apigee = app['core.auth.openstandard.2'].create({
        devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
        scope:'S111',
        into : into,
        stages : [{
            url : function(o) { return 'https://webapi01.binary.com:5002/oauth2/login?template=oauth2%2Fxhr&scope='+encodeURIComponent(o.scope)+'&client_id='+encodeURIComponent(o.devid) },
            onWindowCreate : function() {
                apigee.into.addEventListener('loadstop', function(event) {
					var u = 'https://www.binary.com/clientapp/oauth2/callback';
                    if (event.url.substr(0,u.length) !== u) return;
                    var a = app['core.url'].param.get('code',event.url);
                    apigee.stage2.exec({ code:a });
                });
            },
            onLoad : function() {
                if (typeof into === 'object' && ! into.parentNode) document.body.appendChild(into);
            }
        },{
            url : function(o) { return 'http://www.binary.com/clientapp/oauth2/tokenswap?scope='+encodeURIComponent(o.scope)+'&client_id='+encodeURIComponent(o.devid)+'&code='+encodeURIComponent(o.code) },
            onLoad : function() {
                if (typeof apigee.into === 'object' && apigee.into.parentNode) { apigee.into.parentNode.removeChild(apigee.into); }
                else { apigee.into.close(); }
                app['binarycom.status'].append({ title:'Credentials', lines : new Array('Requesting Details...') });
            },
            onCompletion : function(o) {
                app['binarycom.status'].append({ title:'Credentials', lines : new Array('You have been logged in') });
                app['core.events'].dispatch('binarycom.apigee.login.success', o);
                app['core.store'].set({ id:'binarycom.apigee.auth', value:o.params });
                app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.home') });
            }
        }]
    });

    app['binarycom.apigee'] = {
        
        url : {
            value : url,
            get : function () { return this.value; }
        },
        
        //auth:apigee,
        
        //login : function() {
        //    if (this.status.get()) this.logout();
        //    apigee.stage1.exec();
        //},
        
        //exec : function() {
        //    this.auth.stage1.exec();
        //},
        
        status : {
            get : function () { return app['core.store'].get({ id:'binarycom.apigee.auth' }) },
        },
        
        logout : function() {
            if (this.status.get()) {
                app['core.store'].remove({ id:'binarycom.apigee.auth' });
                app['binarycom.status'].append({ title:'Credentials', lines : new Array('You have been logged out.') });
                app['core.events'].dispatch('binarycom.apigee.logout.success');
                return true;
            }
            app['core.events'].dispatch('binarycom.apigee.logout.failure');
            return false;
        }
    };
    
    window.addEventListener('message', function(m) {
        var a = app['core.url'].param.get('code',m.data.url);
        apigee.stage2.exec({ code:a });
    });
    
    // auto direct on any unauthorised code
    app['core.events'].listeners.add('core.connection.exec.error', function (o) {
        if (o.xhr.status === 401) {
            var a = app['binarycom.apigee'];
            if (o.exe !== a.url.get()) return;
            apigee.stage1.exec();
            setTimeout(function() { app['binarycom.status'].append( { title:'Credentials', lines:new Array('Requesting login...') }); },100); // solved in newer version of Igaro client
        }
    });
}

AppPluginLoaded=true;