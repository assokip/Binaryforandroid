window.addEventListener('load', function() { 
    
    app = new App();
    
    var loading = document.querySelector('body .loading');
    
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
	'binarycom.safety',
	'binarycom.navigate',
	'binarycom.sparkline',
	'binarycom.models',
	'binarycom.models.home',
	'binarycom.models.trade',
	'binarycom.models.charts',
	'binarycom.models.news',
	'binarycom.models.portfolio',
	'binarycom.models.support',
	'binarycom.models.settings'
	
    ), onProgress : function(p) {
	
	loading.querySelector('.wrapper >.progress >.wrapper >.percent').style.width = p.percent +'%';
	
    }, onCompletion : function() {
	
	loading.parentNode.removeChild(loading);

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
	var mvms = document.querySelector('body >.main >.settings >.wrapper >.menu');
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
	
	// connection status icons
	app.core.events.listeners.add('core.connection.exec.start', function (o) {
	    var s = o.status;
	    if (! s.nextto) return;
	    if (s.container) s.nextto.removeChild(s.container);
	    s.container = document.createElement('div');
	    s.container.className = 'app-core-connection-xhr';
	    s.nextto.appendChild(s.container);
	    var icon = document.createElement('div');
	    icon.className = 'loading';
	    s.container.appendChild(icon);
	});
	app.core.events.listeners.add('core.connection.exec.end', function (o) {
	    var s = o.status;
	    if (! s.nextto || ! s.container) return;
	    if (s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
	    s.container=null;
	});
	app.core.events.listeners.add('core.connection.exec.error', function (o) {
	    var s = o.status;
	    if (! s.nextto || ! s.container) return;
	    s.container.firstChild.className = 'error';
	    setTimeout(function() {
		if (s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
		s.container=null; }
	    , 4000);
	});
	
	// cache
	app.core.cache.mode.set(app.core.store.get({ id:'core.cache.mode' }) === false? false : true);
	app.core.events.listeners.add('core.cache.mode.set', function (o) {
	    app.core.store.set({ id:'core.cache.mode', type:'local', value:o });
	    app.binarycom.status.append({ title:'Caching '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
	});
	
	// safety confirmations
	app.binarycom.safety.mode.set(app.core.store.get({ id:'binarycom.safety.mode' }) === false? false : true,true);
	app.core.events.listeners.add('binarycom.safety.mode.set', function (o) {
	    app.binarycom.status.append({ title:'Safety '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
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
	
	// previous login?
	var pl = app.binarycom.apigee.status.get();
	if (pl) app.binarycom.status.append({ title:'Credentials', lines : new Array('Using Previous Login: '+pl.login_id) });
	else { logout.getElementsByClassName('wrapper')[0].className = 'wrapper disabled'; }
	    
	// show home view
	app.binarycom.models.home.init();

    }});
    
});