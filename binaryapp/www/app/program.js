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
	'core.url',
	'core.currency',
	'core.connection',
	'core.connection.xhr',
	'core.form',
	'core.form.message',
	'core.oauth2',
	'binarycom',
	'binarycom.status',
	'binarycom.apigee',
	'binarycom.product',
	'binarycom.safety',
	'binarycom.navigate',
	'binarycom.views'
	
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
	    
	    // debug listeners - events
	    app.core.events.listeners.add('core.debug.mode.set', function (o) {
		if (! o) {
		    var s = app.core.stash.get('core.debug.events.init');
		    if (s) s.forEach( function (b) { app.core.events.listeners.remove(b); });
		    return;	
		}
		var a = new Array();
                a.push(app.core.events.listeners.add('core.events.listeners.add', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:EVENTS:LISTENERS:ADD:'+o.event, type:'debug' });
                }));
                a.push(app.core.events.listeners.add('core.events.listeners.remove', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:EVENTS:LISTENERS:REMOVE:'+o.event, type:'debug' });
                }));
		a.push(app.core.events.listeners.add('core.events.dispatch', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:EVENTS:DISPATCH:'+o.event, type:'debug' }, false);
                }));
		app.core.stash.set('core.debug.events.init', a);
	    });
	    
	    // debug mode & append debug log to console
            app.core.events.listeners.add('core.log.append', function (o) {
		if (o.type !== 'debug') return;
                if (typeof console !== 'undefined') console.log(o.message);
            });

            // view listeners
	    var mvms = document.querySelector('body >.wrapper >.settings >.wrapper >.menu');
	    app.core.events.listeners.add('core.cache.mode.set', function (o) {
	     mvms.querySelector('.cache >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
	    });
	    app.core.events.listeners.add('core.debug.mode.set', function (o) {
		mvms.querySelector('.debug >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
	    });
	    app.core.events.listeners.add('binarycom.safety.mode.set', function (o) {
		mvms.querySelector('.safety >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
	    });
	    app.core.events.listeners.add('binarycom.apigee.login.success', function (o) {
		mvms.querySelector('.logout >.wrapper').className = 'wrapper';
	     });
	    app.core.events.listeners.add('binarycom.apigee.logout.success', function (o) {
		mvms.querySelector('.logout >.wrapper').className = 'wrapper disabled';
	    });

	    // debug listeners - other
	    app.core.debug.mode.set(app.core.store.get({ id:'core.debug.mode' })? true : false);
	    app.core.events.listeners.add('core.debug.mode.set', function (o) {
		app.binarycom.status.append({ title:'Debug Mode '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
		app.core.store.set({ id:'core.debug.mode', value:o });
		if (! o) {
		    var s = app.core.stash.get('core.debug.events');
		    if (s) s.forEach( function (b) { app.core.events.listeners.remove(b); });
		    return;	
		}
		var a = new Array();
                a.push(app.core.events.listeners.add('core.connection.exec.data.json.error', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:CONNECTION:'+o.id+':JSON:ERROR: '+o.xhr.responseText, type:'debug' });
                }));
                a.push(app.core.events.listeners.add('core.connection.exec.start', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:CONNECTION:'+o.id+':START: '+o.lastUrlRequest, type:'debug' });
                }));
                a.push(app.core.events.listeners.add('core.connection.exec.end', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:CONNECTION:'+o.id+':END: '+o.xhr.responseText, type:'debug' });
                }));
                a.push(app.core.events.listeners.add('core.oauth2.login.request', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:OAUTH2:LOGIN:REQUEST: '+o.url, type:'debug' });
                }));
                a.push(app.core.events.listeners.add('core.oauth2.token.issued', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:OAUTH2:TOKEN: '+o.params.token, type:'debug' });
                }));
		a.push(app.core.events.listeners.add('core.view.shown', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:VIEW:SHOWN: '+o.className, type:'debug' });
                }));
		a.push(app.core.events.listeners.add('core.view.hidden', function (o) {
                    app.core.events.dispatch('core.log.append',{ message:'CORE:VIEW:HIDDEN: '+o.className, type:'debug' });
                }));
		app.core.stash.set('core.debug.events', a);
            });
	    
	    // cache
	    app.core.cache.mode.set(app.core.store.get({ id:'core.cache.mode' }) === false? false : true);
	    app.core.events.listeners.add('core.cache.mode.set', function (o) {
		app.core.store.set({ id:'core.cache.mode', type:'local', value:o });
		app.binarycom.status.append({ title:'Caching '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
            });
	    
	    // safety confirmations
	    app.binarycom.safety.mode.set(app.core.store.get({ id:'binarycom.safety.mode' }) === false? false : true);
	    app.core.events.listeners.add('binarycom.safety.mode.set', function (o) {
		app.core.store.set({ id:'binarycom.safety.'+o.id, type:'local', value: { data:o } });
		app.binarycom.status.append({ title:'Safety '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effects confirmation boxes.') });
	    });
	    
            // throw inbuilt alert for most html codes
            app.core.events.listeners.add('core.connection.exec.error', function (o) {
                app.core.connection.active.remove(o);
                var xhr = o.xhr;
                var type = xhr.status === 401? 'critical' : 'warn';
                var title = xhr.status === 0? 'Connection Failure' : xhr.status + ' ('+xhr.statusText+')';
                app.binarycom.status.append( { type:type, id:'error', title:title, lines:new Array(o.resource) });
            });
	    
	    // json errors always go to user
            app.core.events.listeners.add('core.connection.exec.data.json.error', function (o) {
                alert(o.err);
            });
	    
	    // interaction listeners
		// home
		var mvm = document.querySelector('body >.wrapper >.home >.wrapper >.menu');
		    //settings
		    var mvms = document.querySelector('body >.wrapper >.settings >.wrapper >.menu');
		    mvm.getElementsByClassName('settings')[0].addEventListener('click', function() {
		     app.binarycom.views.settings.init();
		    });
		    app.core.events.listeners.add('core.cache.mode.set', function (o) {
		     mvms.querySelector('.cache >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
		    });
		    app.core.events.listeners.add('core.debug.mode.set', function (o) {
			mvms.querySelector('.debug >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
		    });
		    app.core.events.listeners.add('binarycom.safety.mode.set', function (o) {
			mvms.querySelector('.safety >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
		    });
		    app.core.events.listeners.add('binarycom.apigee.login.success', function (o) {
			mvms.querySelector('.logout >.wrapper').className = 'wrapper';
		     });
		    app.core.events.listeners.add('binarycom.apigee.logout.success', function (o) {
			mvms.querySelector('.logout >.wrapper').className = 'wrapper disabled';
		    });
		     
		 mvm.getElementsByClassName('charts')[0].addEventListener('click', function() {
		     app.binarycom.views.charts.init();
		 });
		 mvm.getElementsByClassName('trade')[0].addEventListener('click', function() {
		     app.binarycom.views.trade.init();
		 });
		 mvm.getElementsByClassName('support')[0].addEventListener('click', function() {
		     app.binarycom.views.support.init();
		 });
		 mvm.getElementsByClassName('news')[0].addEventListener('click', function() {
		     app.binarycom.views.news.init();
		 });
		 mvm.getElementsByClassName('portfolio')[0].addEventListener('click', function() {
		     app.binarycom.views.portfolio.init();
		 });
		 
		 // trade
		 document.querySelector('body >.wrapper >.trade >.wrapper >.header >.back').addEventListener('click', function() {
		     if (document.querySelector('body >.wrapper >.trade >.wrapper >.content').style.display==='none') app.binarycom.views.trade.init();
		     else app.binarycom.views.home.init({ effect:'back' });
		 });
	
		 // support
		 document.querySelector('body >.wrapper >.support >.wrapper >.header >.back').addEventListener('click', function() { app.binarycom.views.home.init({ effect:'back' }); });
		 Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
		     if (v.parentNode.className !== 'menu') return;
		     //if (v.className==='back') v.addEventListener('click', function() { app.home.init({ effect:'back' }); });
		     else v.addEventListener('click', function() { eval('app.binarycom.views.support.'+this.className).init(); });
		 });
	
		 // portfolio
		 document.querySelector('body >.wrapper >.portfolio >.wrapper >.header >.back').addEventListener('click', function() { app.binarycom.views.home.init({ effect:'back' }); });
	
		 // charts
		 document.querySelector('body >.wrapper >.charts >.wrapper >.header >.back').addEventListener('click', function() { app.binarycom.views.home.init({ effect:'back' }); });
		 
		 // news
		 document.querySelector('body >.wrapper >.news >.wrapper >.header >.back').addEventListener('click', function() { app.binarycom.views.home.init({ effect:'back' }); });
	
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
		    swm.getElementsByClassName('safety')[0].addEventListener('click', function(confirm) {
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
		     
		     // logout
		    var logout = swm.getElementsByClassName('logout')[0];
		    logout.addEventListener('click', function() {
			if (app.binarycom.apigee.status.get()) app.binarycom.apigee.logout();
			logout.getElementsByClassName('wrapper')[0].className = 'wrapper disabled';
		    });
	     
		    // back
		    sw.querySelector('.header >.back').addEventListener('click', function() {
			this.className = 'back disabled';
			app.binarycom.views.home.init({ effect:'back' });
		    }); 
		    
	    // init 
		// previous login?
		var pl = app.binarycom.apigee.status.get();
		if (pl) app.binarycom.status.append({ title:'Credentials', lines : new Array('Using Previous Login: '+pl.login_id) });
		else { logout.getElementsByClassName('wrapper')[0].className = 'wrapper disabled'; }
		
		// show home view
		app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.home') });

        };

    }});
    
})();