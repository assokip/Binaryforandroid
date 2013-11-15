function AppPlugin(app) {
    
    var url = 'https://rmg-prod.apigee.net/v1/binary';
    var into = app.core.cordova.loaded? null : document.createElement('iframe');
    var apigee = app.core.oauth2.create({
        devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
        scope:'S111',
        into : into,
        stages : [{
            url : function(o) { return 'https://webapi01.binary.com:5002/oauth2/login?template=oauth2%2Fxhr&scope='+o.scope+'&client_id='+o.devid },
            onWindowCreate : function(w) {
                w.addEventListener('loadstop', function(event) {
                    if (event.url === url) return;
                    var a = app.core.url.param.get('code',event.url);
                    ref.close();
                    apigee.stage2.exec({ code:a });
                });
                //w.addEventListener('close', function() {  app.exit(); });
            },
            onLoad : function() {
                if (into) document.body.appendChild(into);
                //status.getElementsByClassName('init')[0].style.display='none';
                //status.getElementsByClassName('stage1')[0].style.display='block';
            }
        },{
            url : function(o) { return 'http://www.binary.com/clientapp/oauth2/tokenswap?scope='+o.scope+'&client_id='+o.devid+'&code='+o.code },
            onLoad : function() {
                //status.getElementsByClassName('stage1')[0].style.display='none';
                //status.getElementsByClassName('stage2')[0].style.display='block';
            },
            onCompletion : function(o) {
                if (into) into.parentNode.removeChild(into);
                app.core.events.dispatch('apigee.login.success', o);
                app.core.store.set({ id:'apigee.auth', value:o.params });
                app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
            }
        }]
    });

    app.apigee = {
        
        url : {
            value : url,
            get : function () { return this.value; }
        },
        
        auth:apigee,
        
        init : function() {
            if (this.status.get()) this.logout();
            apigee.stage1.exec();
        },
        
        status : {
            get : function () { return app.core.store.get({ id:'apigee.auth' }) },
        },
        
        logout : function() {
            if (this.status.get()) {
                app.core.store.remove({ id:'apigee.auth' });
                app.core.events.dispatch('apigee.logout.success');
                return true;
            }
            app.core.events.dispatch('apigee.logout.failure');
            return false;
        }
    };
    
    window.addEventListener('message', function(m) {
        into.style.display='none';
        var a = app.core.url.param.get('code',m.data.url);
        apigee.stage2.exec({ code:a });
    });
    
}