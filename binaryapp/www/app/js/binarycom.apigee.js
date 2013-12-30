module.exports = function (app) {

	var cordova = app['core.cordova'] && app['core.cordova'].loaded? true:false;
    
    var url = 'https://rmg-prod.apigee.net/v1/binary'; // 'http://www.binary.com/clientapp/proxy';
    var into = cordova? null : document.createElement('iframe');
    var apigee = new app['core.auth.openstandard.2']({
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
                app['core.events'].dispatch('binarycom.apigee','login.success', o);
                app['core.store'].set('binarycom.apigee','auth', o.params);
                app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.home') });
            }
        }]
    });

    app['binarycom.apigee'] = {
        
        url : {
            value : url,
            get : function () { return this.value; }
        },
        
        status : {
            get : function () { return app['core.store'].get('binarycom.apigee','auth') },
        },
        
        logout : function() {
            if (this.status.get()) {
                app['core.store'].remove('binarycom.apigee','auth');
                app['binarycom.status'].append({ title:'Credentials', lines : new Array('You have been logged out.') });
                app['core.events'].dispatch('binarycom.apigee','logout.success');
                return true;
            }
            app['core.events'].dispatch('binarycom.apigee','logout.failure');
            return false;
        }
    };

    window.addEventListener('message', function(m) {
        var a = app['core.url'].param.get('code',m.data.url);
        apigee.stage2.exec({ code:a });
    });
    
    // auto direct on any unauthorised code
    app['core.events'].listeners.add('core.connection.xhr','error', function (o) {
        if (o.xhr.status === 401) {
            var a = app['binarycom.apigee'];
            if (o.exe !== a.url.get()) return;
            setTimeout(function() { app['binarycom.status'].append( { title:'Credentials', lines:new Array('Requesting login...') }); },500); // solved in newer version of Igaro client
			setTimeout(function() { apigee.stage1.exec(); }, 500); // give messages time to show
		}
    });

};