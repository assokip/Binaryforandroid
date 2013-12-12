function AppPlugin(app) {
    
    var url = 'https://rmg-prod.apigee.net/v1/binary'; // 'http://www.binary.com/clientapp/proxy';
    var into = app['core.cordova'].loaded? null : document.createElement('iframe');
    var apigee = app['core.oauth2'].create({
        devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
        scope:'S111',
        into : into,
        stages : [{
            url : function(o) { return 'https://webapi01.binary.com:5002/oauth2/login?template=oauth2%2Fxhr&scope='+encodeURIComponent(o.scope)+'&client_id='+encodeURIComponent(o.devid) },
            onWindowCreate : function(w) {
                w.addEventListener('loadstop', function(event) {
                    if (event.url === url) return;
                    var a = app['core.url'].param.get('code',event.url);
                    ref.close();
                    apigee.stage2.exec({ code:a });
                });
                if (app['core.cordova'].loaded) w.addEventListener('close', function() {  app.exit(); });
            },
            onLoad : function() {
                if (into) document.body.appendChild(into);
            }
        },{
            url : function(o) { return 'http://www.binary.com/clientapp/oauth2/tokenswap?scope='+encodeURIComponent(o.scope)+'&client_id='+encodeURIComponent(o.devid)+'&code='+encodeURIComponent(o.code) },
            onLoad : function() {
            },
            onCompletion : function(o) {
                if (into) into.parentNode.removeChild(into);
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
        
        auth:apigee,
        
        login : function() {
            if (this.status.get()) this.logout();
            apigee.stage1.exec();
        },
        
        exec : function() {
            this.auth.stage1.exec();
        },
        
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
        into.style.display='none';
        var a = app['core.url'].param.get('code',m.data.url);
        apigee.stage2.exec({ code:a });
    });
    
    // auto direct on any unauthorised code
    app['core.events'].listeners.add('core.connection.exec.error', function (o) {
        if (o.xhr.status === 401) { var a = app['binarycom.apigee']; if (o.exe === a.url.get()) a.exec(); }
    });
}

AppPluginLoaded=true;