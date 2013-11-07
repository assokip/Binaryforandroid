(function() {
    
    app = new App();
    
    // connection default source
    app.connection.source.default = 'https://rmg-prod.apigee.net/v1/binary';
    
    // set debug mode
    app.debug.set(app.cordova.loaded? true:false);
    
    // add event listeners
    app.events.listeners.add('connection.exec.error', function (o) {
        alert('['+o.xhr.status+'] '+o.xhr.statusText+'\n\n'+o.exe+o.resource);
    });
    app.events.listeners.add('connection.exec.end', function (o) {
        if (o.xhr.status !== 403 || o.xhr.exe !== app.exe) return;
        app.oauth2.init();
        app.oauth2.stage1.exec();
    });
    app.events.listeners.add('connection.exec.data.json.error', function (o) {
        alert(o.err);
    });
    if (app.debug.get()) {
        app.events.listeners.add('connection.exec.data.json.error', function (o) {
            console.log('CONNECTION::DATA::JSON:ERROR:\n'+o.xhr.responseText);
        });
        app.events.listeners.add('connection.exec.end', function (o) {
            console.log('CONNECTION::DATA:'+o.resource+'\n\n'+o.xhr.responseText);
        });
    }
    app.events.listeners.add('exit', function() { app.exit() });
    
    // no cordova, webpage?
    if (app.cordova.loaded) {
       document.addEventListener('deviceready', function () { ready(); });
    } else {
        window.addEventListener('load', function() { ready(); });
    }
    
    
    function ready ()  {
        
        app.navigate = {
            
            current : null,
    
            to : function(o) {
                var view = o.view;
                var ic = Array.prototype.slice.call(view.parentNode.getElementsByTagName('div'));
                var self=this._self;
                
                ic.forEach(function(v) {
                    if (v.parentNode !== view.parentNode || view.className !== v.className) return;
                    var c = v.className.split(' ');
                    for(var i=0; i<c.length;i++) {
                        if (c[i].substr(0,7) !== 'effect_') continue;
                        c.splice(i,1);
                        break;
                    }
                    v.className = c.join(' ');
                    if (o.effect) v.className += ' effect_'+o.effect;
                    var c = this.current && this.current.style.zIndex? this.current.style.zIndex : 999;
                    v.style.zIndex = c+1;
                    v.style.visibility='visible';
                    app.events.dispatch('view.shown',v.className);
                    this.current = v;
                });
                
                setTimeout( function() { ic.forEach(function(v) {
                    if (this.current.parentNode === v.parentNode || v.parentNode !== view.parentNode) return;
                    var c = v.className.split(' ');
                    for(var i=0; i<c.length;i++) {
                        if (c[i].substr(0,7) !== 'effect_') continue;
                        c.splice(i,1);
                        break;
                    }
                    v.className = c.join(' ');
                    v.style.visibility='hidden';
                    v.style.zIndex=0;
                    app.events.dispatch('view.hidden',v.className);
                }) }, 1000);
            }
        };
    
        app.views = {
            
            main : {
                init : function(o) {
                    var effect = o && o.effect? o.effect : 'into';
                    app.navigate.to({ view:document.querySelector('body >.wrapper >.main'), effect:effect });
                }
            },
            
            trade : {
                init : function(o) {
                    var effect = o && o.effect? o.effect : 'into';
                    app.navigate.to({ view:document.querySelector('body >.wrapper >.trade'), effect:effect });
                    //document.querySelector('body >.wrapper >.trade >.wrapper >.content >.markets').innerHTML='';
                    var connection = new igaro_connection({
                        resource: '/markets',
                        headers : { 'Authorization': 'Bearer '+app.oauth2.params.token },
                        onCompletion : function(j) {
                            app.events.dispatch('app.data.markets.revised');
                        }
                    });
                    connection.run();
                    
                }
            },
                    
            portfolio : {
                init : function() {
                    app.navigate.to({ view:document.querySelector('body >.wrapper >.portfolio'), effect:'into' });
                }
            },
                    
            support : {
                init : function() {
                    app.navigate.to({ view:document.querySelector('body >.wrapper >.support'), effect:'into' });
                }
            },
            
            charts : {
                init : function() {
                    app.navigate.to({ view:document.querySelector('body >.wrapper >.charts'), effect:'into' });
                }
            },
                
            news : {
                init : function() {
                    app.navigate.to({ view:document.querySelector('body >.wrapper >.news'), effect:'into' });
                }
            }
        }        
        
        // main
        Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.main >.wrapper >.menu div')).forEach(function(v) {
            if (v.parentNode.className !== 'menu') return;
            if (v.className==='exit') v.addEventListener('click', function() { app.events.dispatch('exit'); });
            else v.addEventListener('click', function() { eval('app.views.'+this.className).init(); });
        });
        
        // support
        document.querySelectorAll('body >.wrapper >.support >.wrapper >.header >.back')[0].addEventListener('click', function() { app.main.init({ effect:'back' }); });
        Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
            if (v.parentNode.className !== 'menu') return;
            //if (v.className==='back') v.addEventListener('click', function() { app.main.init({ effect:'back' }); });
            else v.addEventListener('click', function() { eval('app.views.support.'+this.className).init(); });
        });
        
        // portfolio
        document.querySelectorAll('body >.wrapper >.portfolio >.wrapper >.header >.back')[0].addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
        
        // trade
        document.querySelectorAll('body >.wrapper >.trade >.wrapper >.header >.back')[0].addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
        
        // charts
        document.querySelectorAll('body >.wrapper >.charts >.wrapper >.header >.back')[0].addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
        
        // news
        document.querySelectorAll('body >.wrapper >.news >.wrapper >.header >.back')[0].addEventListener('click', function() { app.viewsmain.init({ effect:'back' }); });
        
        // connecting screen
        var status = document.querySelector('body >.wrapper >.connecting >.wrapper >.status >.wrapper');
        app.navigate.to({ view:document.querySelector('body >.wrapper >.connecting') });
        status.getElementsByClassName('init')[0].style.display='block';
        status.getElementsByClassName('stage1')[0].style.display='none';
        status.getElementsByClassName('stage2')[0].style.display='none';
        status.getElementsByClassName('error')[0].style.display='none'; 
        
        // create a oauth2 object for apigee
        var into = app.cordova.loaded? null : document.createElement('iframe');
        var apigee = app.oauth2.create({
            devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
            scope:'chart',
            into : into,
            stages : [{
                    url : function(o) { return 'https://www.binary.com/clientapp/oauth2/login?scope='+o.scope+'&client_id='+o.devid },
                    onWindowCreate : function(w) {
                        w.addEventListener('loadstop', function(event) {
			    if (event.url === url) return;
			    var a = app.url.param.get('code',event.url);
			    ref.close();
			    apigee.stage2.exec({ code:a });
			});
                        //w.addEventListener('close', function() {  app.exit(); });
                    },
                    onLoad : function() {
                        if (into) document.body.appendChild(into);
                        status.getElementsByClassName('init')[0].style.display='none';
                        status.getElementsByClassName('stage1')[0].style.display='block';
                    }
                },{
                    url : function(o) { return 'https://www.binary.com/clientapp/oauth2/tokenswap?scope='+o.scope+'&client_id='+o.devid+'&code='+o.code },
                    onLoad : function() {
                        status.getElementsByClassName('stage1')[0].style.display='none';
                        status.getElementsByClassName('stage2')[0].style.display='block';
                    },
                    onCompletion : function(o) {
                        if (into) into.parentNode.removeChild(into);
                        app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
			document.querySelector('body >.wrapper >.main >.wrapper >.login_id').innerHTML = j.params.login_id;
                    }
                }
            ]
        });
        if (into) {
            into.addEventListener('message', function(m) {
                alert(m.url);
                into.style.display='none';
                var a = app.url.param.get('code',m.url);
                apigee.stage2.exec({ code:a });
            });
        }
        apigee.stage1.exec();

    };

})();