(function() {
    
    app = new App();
    
    // init plugins
    app.plugins.load({ root:'app', plugins: new Array(
        
        'stash',
	'cordova',
	//'jsload',
	//'cookie',
	'status',
	'url',
	'currency',
	'connection',
	'connection.xhr',
	'form.message',
	'oauth2'
        
    ), onCompletion : function() {
    
        // no cordova, webpage?
        if (app.cordova.loaded) {
           document.addEventListener('deviceready', function () { ready(); });
        } else {
            window.addEventListener('load', function() { ready(); });
        }
        
        function ready ()  {
            
            // connection default source
            app.connection.source.def = 'https://rmg-prod.apigee.net/v1/binary';
            
            // set debug mode
            app.debug.set(true);
            /* var urlp = app.url.param.get('app.debug');
            if (urlp == 1 || urlp == 0) app.cookie.set('app.debug', urlp);
            var debug = app.cookie.get('app.debug')===1? true:false;
            app.debug.set(debug);
            */
            
            // throw inbuilt alert for most html codes
            app.events.listeners.add('connection.exec.error', function (o) {
                app.connection.active.remove(o);
                var xhr = o.xhr;
                var type = xhr.status === 401? 'critical' : 'warn';
                var title = xhr.status === 0? 'Connection Failure' : xhr.status + ' ('+xhr.statusText+')';
                app.events.dispatch('status.append', { type:type, id:'error', title:title, lines:new Array(o.resource) });
            });
	    
            app.events.listeners.add('connection.exec.data.json.error', function (o) {
                alert(o.err);
            });
            if (app.debug.get()) {
                app.events.listeners.add('connection.exec.data.json.error', function (o) {
                    app.events.dispatch('log.append','CONNECTION:'+o.id+':JSON:ERROR: '+o.xhr.responseText);
                });
                app.events.listeners.add('connection.exec.start', function (o) {
                    app.events.dispatch('log.append','CONNECTION:'+o.id+':START: '+o.lastUrlRequest);
                });
                app.events.listeners.add('connection.exec.end', function (o) {
                    app.events.dispatch('log.append','CONNECTION:'+o.id+':END: '+o.xhr.responseText);
                });
                app.events.listeners.add('oauth2.login.request', function (o) {
                    app.events.dispatch('log.append','OAUTH2:LOGIN:REQUEST: '+o.url);
                });
                app.events.listeners.add('oauth2.token.issued', function (o) {
                    app.events.dispatch('log.append','OAUTH2:TOKEN: '+o.params.token);
                });
            }
            app.events.listeners.add('exit', function() { app.exit() });
            
            // log messages to console
            app.events.listeners.add('log.append', function (m) {
                if (typeof console !== 'undefined') console.log(m);
            });
            
            // status alerts
            var stc = document.createElement('div');
            stc.className = 'status';
            document.body.appendChild(stc);
            stc.addEventListener('click', function() {
                app.status.remove();
                this.style.display='none';
            });
            app.events.listeners.add('status.remove', function (id) {
                app.status.remove(id);
                stc.getElementsByTagName('nav')[0].getElementsByTagName('ul')[0].removeChild(id);
                if (! app.status.events.length) {
                    stc.removeChild(stc.getElementsByTagName('nav')[0]);
                    stc.style.display='none';
                }
            });
            app.events.listeners.add('status.append', function (o) {
                var ul;
                if (! app.status.events.length) {
                    var nav = document.createElement('nav');
                    stc.appendChild(nav);
                    ul = document.createElement('ul');
                    nav.appendChild(ul);
                } else {
                    ul = stc.getElementsByTagName('nav')[0].getElementsByTagName('ul')[0];
                }
                var kl = document.createElement('li');
                app.status.append(kl);
                stc.style.display='block';
                ul.appendChild(kl);
                    var aa = document.createElement('div');
                    aa.className='type';
                    kl.appendChild(aa);
                        var aaa = document.createElement('div');
                        aaa.className=o.type? o.type : 'warn';
                        aa.appendChild(aaa);
                    var ab = document.createElement('div');
                    ab.className='details';
                    kl.appendChild(ab);
                    var aba = document.createElement('div');
                        aba.className=o.id? o.id : 'standard';
                        ab.appendChild(aba);
                        if (o.title) {
                            var g = document.createElement('div');
                            g.className='title';
                            g.innerHTML=o.title;
                            aba.appendChild(g);
                        }
                        o.lines.forEach(function (t) {
                            var g = document.createElement('div');
                            g.className='line';
                            g.innerHTML=t;
                            aba.appendChild(g);
                        }); 
               setTimeout(function() { app.events.dispatch('status.remove',kl) },6000);
            });
            
            // create a oauth2 object for apigee
            var into = app.cordova.loaded? null : document.createElement('iframe');
            var apigee = app.oauth2.create({
                devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
                scope:'chart',
                into : into,
                stages : [{
                        url : function(o) { return 'https://webapi01.binary.com:5002/oauth2/login?template=oauth2/xhr&scope='+o.scope+'&client_id='+o.devid },
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
                        url : function(o) { return 'http://www.binary.com/clientapp/oauth2/tokenswap?scope='+o.scope+'&client_id='+o.devid+'&code='+o.code },
                        onLoad : function() {
                            status.getElementsByClassName('stage1')[0].style.display='none';
                            status.getElementsByClassName('stage2')[0].style.display='block';
                        },
                        onCompletion : function(o) {
                            if (into) into.parentNode.removeChild(into);
                            app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
                            app.stash.set('user.login.id', o.params.login_id);
                            app.stash.set('security.apigee.oauth2.token', o.params.token);
                            app.events.dispatch('status.append',{ title:'Credentials', lines : new Array('Logged in as '+o.params.login_id) });
                        }
                    }
                ]
            });
            
            app.events.listeners.add('connection.exec.end', function (o) {
                if (o.xhr.status !== 403 || o.xhr.exe !== app.connection.source.def) return;
                alert('['+o.xhr.status+'] '+o.xhr.statusText+'\n\n'+o.exe+o.resource);
                apigee.stage1.exec();
            });
             
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
                    
                    connection : new app.connection.create({
                        headers : { 'Authorization': 'Bearer '+app.stash.get('security.apigee.oauth2.token') },
                        statusnextto: document.querySelectorAll('body >.wrapper >.main >.wrapper >.menu div')[0]
                    }),
                        
                    init : function(o) {
                        //document.querySelector('body >.wrapper >.trade >.wrapper >.content >.markets').innerHTML='';
                        var c = this.connection;
                        c.resource = '/markets';
                        c.onCompletion = function(j) {
                            alert(JSON.stringify(j));
                            var effect = o && o.effect? o.effect : 'into';
                            app.navigate.to({ view:document.querySelector('body >.wrapper >.trade'), effect:effect });
                            app.events.dispatch('app.data.markets.revised');
                        };
                        c.run();
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
            document.querySelectorAll('body >.wrapper >.support >.wrapper >.header >.back')[0].addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
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
            
            window.addEventListener('message', function(m) {
                into.style.display='none';
                var a = app.url.param.get('code',m.data.url);
                apigee.stage2.exec({ code:a });
            });
            
            apigee.stage1.exec();
    
        };

    }});
    
})();

