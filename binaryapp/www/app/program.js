(function() {
    
    app = new App();
    
    // init plugins
    app.plugins.load({ root:'app', plugins: new Array(
        
        'stash',
	'store',
	'cache',
	'cordova',
	//'jsload',
	'status',
	'url',
	'currency',
	'connection',
	'connection.xhr',
	'form.message',
	'oauth2',
	'binarycom'
	
    ), onProgress : function(p) {
	
	document.querySelector('body >.wrapper >.loading').style.display='block';
	var l = document.querySelector('body >.wrapper >.loading >.wrapper >.progress >.wrapper >.percent').style.width = p.percent +'%';
	
    }, onCompletion : function() {
	
	document.querySelector('body >.wrapper >.loading').style.display='none';
    
        // no cordova, webpage?
        if (app.cordova.loaded) {
           document.addEventListener('deviceready', function () { ready(); });
        } else {
            window.addEventListener('load', function() { ready(); });
        }
        
        function ready ()  {
            
            // connection default source
            app.connection.source.def = 'https://rmg-prod.apigee.net/v1/binary';
            
            // debug toggle
            app.debug.set(app.store.get({ id:'core.debug' })? true : false);
	    app.events.listeners.add('core.debug.mode.toggled', function (o) {
		app.events.dispatch('core.status.append',{ title:'Debug Mode '+(o? 'Enabled' : 'Disabled'), lines : new Array('Please restart the application.') });
            });
	    
	    // cache
	    app.cache.mode.set(app.store.get({ id:'core.cache.mode' } === false)? false : true);
	    app.events.listeners.add('core.cache.mode.toggled', function (o) {
		app.events.dispatch('core.status.append',{ title:'Caching '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
            });
	  
            // throw inbuilt alert for most html codes
            app.events.listeners.add('core.connection.exec.error', function (o) {
                app.connection.active.remove(o);
                var xhr = o.xhr;
                var type = xhr.status === 401? 'critical' : 'warn';
                var title = xhr.status === 0? 'Connection Failure' : xhr.status + ' ('+xhr.statusText+')';
                app.events.dispatch('core.status.append', { type:type, id:'error', title:title, lines:new Array(o.resource) });
            });
	    
	    // json errors always go to user
            app.events.listeners.add('core.connection.exec.data.json.error', function (o) {
                alert(o.err);
            });
	    
	    // debugging, if enabled
            if (app.debug.get()) {
                app.events.listeners.add('core.connection.exec.data.json.error', function (o) {
                    app.events.dispatch('core.log.append','CONNECTION:'+o.id+':JSON:ERROR: '+o.xhr.responseText);
                });
                app.events.listeners.add('core.connection.exec.start', function (o) {
                    app.events.dispatch('core.log.append','CONNECTION:'+o.id+':START: '+o.lastUrlRequest);
                });
                app.events.listeners.add('core.connection.exec.end', function (o) {
                    app.events.dispatch('core.log.append','CONNECTION:'+o.id+':END: '+o.xhr.responseText);
                });
                app.events.listeners.add('core.oauth2.login.request', function (o) {
                    app.events.dispatch('core.log.append','OAUTH2:LOGIN:REQUEST: '+o.url);
                });
                app.events.listeners.add('core.oauth2.token.issued', function (o) {
                    app.events.dispatch('core.log.append','OAUTH2:TOKEN: '+o.params.token);
                });
		app.events.listeners.add('core.view.shown', function (o) {
                    app.events.dispatch('core.log.append','VIEW:SHOWN: '+o.className);
                });
		app.events.listeners.add('core.view.hidden', function (o) {
                    app.events.dispatch('core.log.append','VIEW:HIDDEN: '+o.className);
                });
            }
            
            // append log to console
            app.events.listeners.add('core.log.append', function (m) {
                if (typeof console !== 'undefined') console.log(m);
            });
	    
	    // apigee
	    app.events.listeners.add('apigee.oauth2.login.success', function (o) {
		app.store.set({ id:'apigee.oauth2', value:o.params });
		app.stash.set({ id:'apigee.oauth2', value:o.params });		
		app.events.dispatch('core.status.append',{ title:'Credentials', lines : new Array('You have been logged in') });
	    });
	    app.events.listeners.add('apigee.oauth2.logout', function (o) {
		app.store.remove({ id:'apigee.oauth2' });
		app.stash.remove('apigee.oauth2');
		app.events.dispatch('core.status.append',{ title:'Credentials', lines : new Array('You have been logged out.') });
	    });
            app.events.listeners.add('core.connection.exec.error', function (o) {
                if (o.xhr.status !== 401 || o.exe !== app.connection.source.def) return;
		if (app.stash.get({ id:'apigee.oauth2' })) app.events.dispatch('apigee.oauth2.logout');
		apigee.stage1.exec();
            });

            // status alerts
            var stc = document.createElement('div');
            stc.className = 'status';
            document.body.appendChild(stc);
            stc.addEventListener('click', function() {
                app.status.remove();
                this.style.display='none';
            });
            app.events.listeners.add('core.status.remove', function (id) {
                app.status.remove(id);
                try { stc.getElementsByTagName('nav')[0].getElementsByTagName('ul')[0].removeChild(id); }
		catch (e) {};
		
                if (! app.status.events.length) {
                    stc.removeChild(stc.getElementsByTagName('nav')[0]);
                    stc.style.display='none';
                }
            });
            app.events.listeners.add('core.status.append', function (o) {
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
               setTimeout(function() { app.events.dispatch('core.status.remove',kl) },6000);
            });
            
            // create a oauth2 object for apigee
            var into = app.cordova.loaded? null : document.createElement('iframe');
            var apigee = app.oauth2.create({
                devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
                scope:'S111',
                into : into,
                stages : [{
		    url : function(o) { return 'https://webapi01.binary.com:5002/oauth2/login?template=oauth2%2Fxhr&scope='+o.scope+'&client_id='+o.devid },
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
			app.events.dispatch('apigee.oauth2.login.success', o);
			app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
		    }
		}]
            });
            window.addEventListener('message', function(m) {
                into.style.display='none';
                var a = app.url.param.get('code',m.data.url);
                apigee.stage2.exec({ code:a });
            });
	    
            
            //app.events.listeners.add('core.connection.exec.end', function (o) {
            //    if (o.xhr.status !== 403 || o.xhr.exe !== app.connection.source.def) return;
            //    alert('['+o.xhr.status+'] '+o.xhr.statusText+'\n\n'+o.exe+o.resource);
            //    apigee.stage1.exec();
            //});
             
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
                        app.events.dispatch('core.view.shown',v);
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
			    app.events.dispatch('core.view.hidden',v);
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
                    
                    connection : new app.connection.create(),
		    
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
			    onCompletion : function() {
				var m = Object.keys(app.binarycom.product.data.selectors.market).sort();
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
					app.binarycom.product.data.offerings.some(function (offering) {
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
            
	    // trade
            document.querySelector('body >.wrapper >.trade >.wrapper >.header >.back').addEventListener('click', function() {
		if (document.querySelector('body >.wrapper >.trade >.wrapper >.content').style.display==='none') app.views.trade.init();
		else app.views.main.init({ effect:'back' });
	    });
	    document.querySelector('body >.wrapper >.main >.wrapper >.menu >.trade').addEventListener('click', function() {
		app.views.trade.init();
            });

            // support
            document.querySelector('body >.wrapper >.support >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
            Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
                if (v.parentNode.className !== 'menu') return;
                //if (v.className==='back') v.addEventListener('click', function() { app.main.init({ effect:'back' }); });
                else v.addEventListener('click', function() { eval('app.views.support.'+this.className).init(); });
            });
	    document.querySelector('body >.wrapper >.main >.wrapper >.menu >.support').addEventListener('click', function() {
		app.views.support.init();
            });
            
            // portfolio
            document.querySelector('body >.wrapper >.portfolio >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
	    document.querySelector('body >.wrapper >.main >.wrapper >.menu >.portfolio').addEventListener('click', function() {
		app.views.portfolio.init();
            });
            
            // charts
            document.querySelector('body >.wrapper >.charts >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
	    document.querySelector('body >.wrapper >.main >.wrapper >.menu >.charts').addEventListener('click', function() {
		app.views.charts.init();
            });
            
            // news
            document.querySelector('body >.wrapper >.news >.wrapper >.header >.back').addEventListener('click', function() { app.views.main.init({ effect:'back' }); });
	    document.querySelector('body >.wrapper >.main >.wrapper >.menu >.news').addEventListener('click', function() {
		app.views.news.init();
            });
	    
	    // settings
	    var sw = document.querySelector('body >.wrapper >.settings >.wrapper')
	    var ta = sw.querySelector('.menu >.debug');
	    ta.addEventListener('click', function() {
		if (app.debug.get()) {
		    app.debug.set(false);
		    app.store.set({ id:'core.debug', value:false });
		    this.querySelector('.wrapper').className = 'wrapper off';
		} else {
		    app.debug.set(true);
		    app.store.set({ id:'core.debug', value:true });
		    this.querySelector('.wrapper').className = 'wrapper on';
		}
	    });
	    var tb = sw.querySelector('.menu >.cache');
	    tb.addEventListener('click', function() {
		if (app.cache.mode.get()) {
		    app.cache.mode.set(false);
		    app.store.set({ id:'core.cache.mode', value:false });
		    this.querySelector('.wrapper').className = 'wrapper off';
		} else {
		    app.cache.mode.set(true);
		    app.store.set({ id:'core.cache.mode', value:true });
		    this.querySelector('.wrapper').className = 'wrapper on';
		}
	    });
	    sw.querySelector('.header >.back').addEventListener('click', function() {
		app.views.main.init({ effect:'back' });
	    });
	    document.querySelector('body >.wrapper >.main >.wrapper >.menu >.settings').addEventListener('click', function() {
		ta.querySelector('.wrapper').className += app.debug.get()? ' on' : ' off';
		tb.querySelector('.wrapper').className += app.cache.mode.get()? ' on' : ' off';
		app.views.settings.init();
            });
	    
	    // previous login?
	    var pl = app.store.get({ id:'apigee.oauth2' });
	    if (pl) {
		app.stash.set('apigee.oauth2',pl);
		app.events.dispatch('core.status.append',{ title:'Credentials', lines : new Array('Using Previous Login: '+pl.login_id) });
	    }
	    
	    app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
        };

    }});
    
})();