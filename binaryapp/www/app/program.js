(function() {
    
    app = new App();
    
    // init plugins
    app.plugins.load({ root:'app', plugins: new Array(
        'core',
	'core.debug',
	'core.events',
        'core.stash',
	'core.store',
	'core.cache',
	'core.cordova',
	//'core.jsload',
	'core.status',
	'core.url',
	'core.currency',
	'core.connection',
	'core.connection.xhr',
	'core.form',
	'core.form.message',
	'core.oauth2',
	'binarycom',
	'binarycom.product',
	'binarycom.safety'
	
    ), onProgress : function(p) {
	
	document.querySelector('body >.wrapper >.loading').style.display='block';
	var l = document.querySelector('body >.wrapper >.loading >.wrapper >.progress >.wrapper >.percent').style.width = p.percent +'%';
	
    }, onCompletion : function() {
	
	document.querySelector('body >.wrapper >.loading').style.display='none';
    
        // no cordova, webpage?
        if (app.core.cordova.loaded) {
           document.addEventListener('deviceready', function () { ready(); });
        } else {
            window.addEventListener('load', function() { ready(); });
        }
        
        function ready ()  {
            
            // connection default source
            app.core.connection.source.def = 'https://rmg-prod.apigee.net/v1/binary';
            
            // debug
            app.core.debug.mode.set(app.core.store.get({ id:'core.debug.mode' })? true : false);
	    var debugaddeve = function() { 
		var a = new Array();
                a.push(app.core.events.listeners.add('core.connection.exec.data.json.error', function (o) {
                    app.core.events.dispatch('core.log.append','CONNECTION:'+o.id+':JSON:ERROR: '+o.xhr.responseText);
                }));
                a.push(app.core.events.listeners.add('core.connection.exec.start', function (o) {
                    app.core.events.dispatch('core.log.append','CONNECTION:'+o.id+':START: '+o.lastUrlRequest);
                }));
                a.push(app.core.events.listeners.add('core.connection.exec.end', function (o) {
                    app.core.events.dispatch('core.log.append','CONNECTION:'+o.id+':END: '+o.xhr.responseText);
                }));
                a.push(app.core.events.listeners.add('core.oauth2.login.request', function (o) {
                    app.core.events.dispatch('core.log.append','OAUTH2:LOGIN:REQUEST: '+o.url);
                }));
                a.push(app.core.events.listeners.add('core.oauth2.token.issued', function (o) {
                    app.core.events.dispatch('core.log.append','OAUTH2:TOKEN: '+o.params.token);
                }));
		a.push(app.core.events.listeners.add('core.view.shown', function (o) {
                    app.core.events.dispatch('core.log.append','VIEW:SHOWN: '+o.className);
                }));
		a.push(app.core.events.listeners.add('core.view.hidden', function (o) {
                    app.core.events.dispatch('core.log.append','VIEW:HIDDEN: '+o.className);
                }));
		app.core.stash.set('core.debug.events', a);
	    }
	    app.core.events.listeners.add('core.debug.mode.toggled', function (o) {
		app.core.events.dispatch('core.status.append',{ title:'Debug Mode '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
		app.core.store.set({ id:'core.debug.mode', value:o });
		if (o) { debugaddeve(); }
		else {
		    app.core.stash.get('core.debug.events').forEach( function (b) { app.core.events.listeners.remove(b); });
		    app.core.stash.remove('core.debug.events');
		}
            });
	    if (app.core.debug.mode.get()) debugaddeve();

	    // cache
	    app.core.cache.mode.set(app.core.store.get({ id:'core.cache.mode' }) === false? false : true);
	    app.core.events.listeners.add('core.cache.mode.toggled', function (o) {
		app.core.store.set({ id:'core.cache.mode', value:o });
		app.core.events.dispatch('core.status.append',{ title:'Caching '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
            });
	    
	    // safety
	    app.binarycom.safety.mode.set(app.core.store.get({ id:'binaryapp.safety.mode' }) === false? false : true);
	    app.core.events.listeners.add('binaryapp.safety.mode.toggled', function (o) {
		app.core.store.set({ id:'binaryapp.safety.mode', value:o });
		app.core.events.dispatch('core.status.append',{ title:'Safety '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effects confirmation boxes.') });
            });
	    
            // throw inbuilt alert for most html codes
            app.core.events.listeners.add('core.connection.exec.error', function (o) {
                app.core.connection.active.remove(o);
                var xhr = o.xhr;
                var type = xhr.status === 401? 'critical' : 'warn';
                var title = xhr.status === 0? 'Connection Failure' : xhr.status + ' ('+xhr.statusText+')';
                app.core.events.dispatch('core.status.append', { type:type, id:'error', title:title, lines:new Array(o.resource) });
            });
	    
	    // json errors always go to user
            app.core.events.listeners.add('core.connection.exec.data.json.error', function (o) {
                alert(o.err);
            });
            
            // append log to console
            app.core.events.listeners.add('core.log.append', function (m) {
                if (typeof console !== 'undefined') console.log(m);
            });
	    
	    // apigee
	    app.core.events.listeners.add('apigee.oauth2.login.success', function (o) {
		app.core.store.set({ id:'apigee.oauth2', value:o.params });
		app.core.stash.set({ id:'apigee.oauth2', value:o.params });		
		app.core.events.dispatch('core.status.append',{ title:'Credentials', lines : new Array('You have been logged in') });
	    });
	    app.core.events.listeners.add('apigee.oauth2.logout', function (o) {
		app.core.store.remove({ id:'apigee.oauth2' });
		app.core.stash.remove('apigee.oauth2');
		app.core.events.dispatch('core.status.append',{ title:'Credentials', lines : new Array('You have been logged out.') });
	    });
            app.core.events.listeners.add('core.connection.exec.error', function (o) {
                if (o.xhr.status !== 401 || o.exe !== app.core.connection.source.def) return;
		if (app.core.stash.get({ id:'apigee.oauth2' })) app.core.events.dispatch('apigee.oauth2.logout');
		apigee.stage1.exec();
            });

            // status alerts
            var stc = document.createElement('div');
            stc.className = 'status';
            document.body.appendChild(stc);
            stc.addEventListener('click', function() {
                app.core.status.remove();
                this.style.display='none';
            });
            app.core.events.listeners.add('core.status.remove', function (id) {
                app.core.status.remove(id);
                try { stc.getElementsByTagName('nav')[0].getElementsByTagName('ul')[0].removeChild(id); }
		catch (e) {};
		
                if (! app.core.status.events.length) {
                    stc.removeChild(stc.getElementsByTagName('nav')[0]);
                    stc.style.display='none';
                }
            });
            app.core.events.listeners.add('core.status.append', function (o) {
                var ul;
                if (! app.core.status.events.length) {
                    var nav = document.createElement('nav');
                    stc.appendChild(nav);
                    ul = document.createElement('ul');
                    nav.appendChild(ul);
                } else {
                    ul = stc.getElementsByTagName('nav')[0].getElementsByTagName('ul')[0];
                }
                var kl = document.createElement('li');
                app.core.status.append(kl);
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
               setTimeout(function() { app.core.events.dispatch('core.status.remove',kl) },6000);
            });
            
            // create a oauth2 object for apigee
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
			app.core.events.dispatch('apigee.oauth2.login.success', o);
			app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
		    }
		}]
            });
            window.addEventListener('message', function(m) {
                into.style.display='none';
                var a = app.core.url.param.get('code',m.data.url);
                apigee.stage2.exec({ code:a });
            });
	    
            app.navigate = {
                
                current : null,
        
                to : function(o) {
                    var view = o.view;
                    var ic = Array.prototype.slice.call(view.parentNode.getElementsByTagName('div'));
                    var self=this._self;
                    
                    ic.forEach(function(v) {
			var c = v.className.split(' ');
                        if (v.parentNode !== view.parentNode || view.className !== c[0]) return;
                        for(var i=0; i<c.length;i++) {
                            if (c[i].substr(0,7) !== 'effect_') continue;
                            c.splice(i,1);
                            break;
                        }
                        v.className = c.join(' ');
                        if (o.effect) v.className += ' effect_'+o.effect;
                        if (this.current) this.current.style.zIndex=0;
                        v.style.zIndex = 1;
                        v.style.visibility='visible';
                        app.core.events.dispatch('core.view.shown',v);
                        this.current = v;
                    });
                    
                    setTimeout( function() {
			ic.forEach(function(v) {
			    if (this.current.parentNode !== v.parentNode || v === this.current || v.style.visibility==='hidden') return;
			    var c = v.className.split(' ');
			    for(var i=0; i<c.length;i++) {
				if (c[i].substr(0,7) !== 'effect_') continue;
				c.splice(i,1);
				break;
			    }
			    v.className = c.join(' ');
			    v.style.visibility='hidden';
			    v.style.zIndex=0;
			    app.core.events.dispatch('core.view.hidden',v);
			})
		    }, 300);
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
                    
                    connection : new app.core.connection.create(),
		    
		    marketselected : null,
		    submarketselected : null,
		    symbolselected : null,
		    contractcategory : null,
                        
                    init : function(o) {
			var views = document.querySelectorAll('body >.wrapper >.trade >.wrapper >.content');
			views[0].style.display='block';
			views[1].style.display='none';
			var self = this;
			app.binarycom.product.get({
			    statusnextto : document.querySelector('body >.wrapper >.main >.wrapper >.menu div'),
			    onCompletion : function(data) {
				var m = Object.keys(data.selectors.market).sort();
				var markets = views[0].querySelector('.markets >.data');
				while(markets.firstChild) { markets.removeChild(markets.firstChild); };
				m.forEach(function (market) {
				    var dc = document.createElement('div');
				    if (self.marketselected === market) dc.className='selected';
				    dc.innerHTML = market;
				    dc.addEventListener('click', function() {
					Array.prototype.slice.call(markets.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
					dc.className='selected';
					self.marketselected = market;
					var submarkets = views[0].querySelector('.submarkets >.data');
					while(submarkets.firstChild) { submarkets.removeChild(submarkets.firstChild); };
					views[0].getElementsByClassName('submarkets')[0].style.display='block';
					views[0].getElementsByClassName('symbols')[0].style.display='none';
					views[0].getElementsByClassName('contractcategory')[0].style.display='none';
					data.offerings.some(function (offering) {
					    if (offering.market !== market) return;
					    offering.available.forEach(function(a) {
						var dc = document.createElement('div');
						dc.innerHTML = a.submarket;
						submarkets.appendChild(dc);
						dc.addEventListener('click', function() {
						    Array.prototype.slice.call(submarkets.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
						    dc.className='selected';
						    self.submarketselected = a.submarket;
						    var symbols = views[0].querySelector('.symbols >.data');
						    while(symbols.firstChild) { symbols.removeChild(symbols.firstChild); };
						    views[0].getElementsByClassName('symbols')[0].style.display='block';
						    views[0].getElementsByClassName('contractcategory')[0].style.display='none';
						    a.available.forEach(function(a) {
							var dc = document.createElement('div');
							dc.innerHTML = a.symbol;
							symbols.appendChild(dc);
							dc.addEventListener('click', function() {
							    Array.prototype.slice.call(symbols.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
							    dc.className='selected';
							    self.symbolselected = a.symbol;
							    var contractcategory = views[0].querySelector('.contractcategory >.data');
							    while(contractcategory.firstChild) { contractcategory.removeChild(contractcategory.firstChild); };
							    views[0].getElementsByClassName('contractcategory')[0].style.display='block';
							    a.available.forEach(function(a) {
								var dc = document.createElement('div');
								dc.innerHTML = a.contract_category;
								contractcategory.appendChild(dc);
								dc.addEventListener('click', function() {
								    self.contractcategoryselected = a.contract_category;
								    views[1].style.display='block';
								    views[0].style.display='none';
								    var title = views[1].getElementsByClassName('title')[0];
								    while(title.firstChild) { title.removeChild(title.firstChild); };
								    var s = document.createElement('div');
								    s.innerHTML = self.marketselected;
								    title.appendChild(s);
								    s = document.createElement('div');
								    s.innerHTML = self.submarketselected;
								    title.appendChild(s);
								    s = document.createElement('div');
								    s.innerHTML = self.symbolselected;
								    title.appendChild(s);
								    s = document.createElement('div');
								    s.innerHTML = self.contractcategoryselected;
								    title.appendChild(s);
								});
							    });
							});
						    });
						});
					    });
					    return true;
					});
				    });
				    markets.appendChild(dc);
				});
				
				app.navigate.to({ view:document.querySelector('body >.wrapper >.trade'), effect:o && o.effect? o.effect : 'into' });
			    }

			});
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
                },
		
		settings : {
                    init : function() {
                        app.navigate.to({ view:document.querySelector('body >.wrapper >.settings'), effect:'into' });
                    }
                }
            }
	    
	    // main
	    var mvm = document.querySelector('body >.wrapper >.main >.wrapper >.menu');
	    mvm.getElementsByClassName('settings')[0].addEventListener('click', function() {
		var tq = document.querySelector('body >.wrapper >.settings >.wrapper >.menu');
		tq.querySelector('.debug >.wrapper').className += app.core.debug.mode.get()? ' on' : ' off';
		tq.querySelector('.cache >.wrapper').className += app.core.cache.mode.get()? ' on' : ' off';
		tq.querySelector('.safety >.wrapper').className += app.binarycom.safety.mode.get()? ' on' : ' off';
		app.views.settings.init();
            });
	    mvm.getElementsByClassName('charts')[0].addEventListener('click', function() {
		app.views.charts.init();
            });
	    mvm.getElementsByClassName('trade')[0].addEventListener('click', function() {
		app.views.trade.init();
            });
	    mvm.getElementsByClassName('support')[0].addEventListener('click', function() {
		app.views.support.init();
            });
	    mvm.getElementsByClassName('news')[0].addEventListener('click', function() {
		app.views.news.init();
            });
	    mvm.getElementsByClassName('portfolio')[0].addEventListener('click', function() {
		app.views.portfolio.init();
            });
	    
	    // trade
            document.querySelector('body >.wrapper >.trade >.wrapper >.header >.back').addEventListener('click', function() {
		if (document.querySelector('body >.wrapper >.trade >.wrapper >.content').style.display==='none') app.views.trade.init();
		else app.views.main.init({ effect:'back' });
	    });

            // support
            document.querySelector('body >.wrapper >.support >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
            Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
                if (v.parentNode.className !== 'menu') return;
                //if (v.className==='back') v.addEventListener('click', function() { app.main.init({ effect:'back' }); });
                else v.addEventListener('click', function() { eval('app.views.support.'+this.className).init(); });
            });

            // portfolio
            document.querySelector('body >.wrapper >.portfolio >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });

            // charts
            document.querySelector('body >.wrapper >.charts >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
            
            // news
            document.querySelector('body >.wrapper >.news >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });

	    // settings
	    var sw = document.querySelector('body >.wrapper >.settings >.wrapper');
		// debug
		var swm = sw.getElementsByClassName('menu')[0];
		swm.getElementsByClassName('debug')[0].addEventListener('click', function() {
		    var tx = app.core.debug.mode;
		    var cx = this.getElementsByClassName('wrapper')[0];
		    if (tx.get()) {
			tx.set(false);
			cx.className = 'wrapper off';
		    } else {
			tx.set(true);
			cx.className = 'wrapper on';
		    }
		});
		// cache
		swm.getElementsByClassName('cache')[0].addEventListener('click', function() {
		    var tx = app.core.cache.mode;
		    var cx = this.getElementsByClassName('wrapper')[0];
		    if (tx.get()) {
			tx.set(false);
			cx.className = 'wrapper off';
		    } else {
			tx.set(true);
			cx.className = 'wrapper on';
		    }
		});
		// safety
		swm.getElementsByClassName('safety')[0].addEventListener('click', function() {
		    var tx = app.binarycom.safety.mode;
		    var cx = this.getElementsByClassName('wrapper')[0];
		    if (tx.get()) {
			tx.set(false);
			cx.className = 'wrapper off';
		    } else {
			tx.set(true);
			cx.className = 'wrapper on';
		    }
		});
		// back
		sw.querySelector('.header >.back').addEventListener('click', function() {
		    app.views.main.init({ effect:'back' });
		});

	    // init 
		// previous login?
		var pl = app.core.store.get({ id:'apigee.oauth2' });
		if (pl) {
		    app.core.stash.set('apigee.oauth2',pl);
		    app.core.events.dispatch('core.status.append',{ title:'Credentials', lines : new Array('Using Previous Login: '+pl.login_id) });
		}
		
		// show main view
		app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
		

		
        };

    }});
    
})();