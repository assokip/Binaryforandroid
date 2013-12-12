window.addEventListener('load', function() {
    
    app = new Object();
    var env = AppEnv();

    /* application plugins below */
    var p = new Array();
    var b = env.browser;
    var be = b.engine;
    var bj = b.js;
    if (bj.version < 1.6) p.push({ name:'polyfix.js.1.6' });
    if (bj.version < 1.81) p.push({ name:'polyfix.js.1.8.1' });
    if (bj.version < 1.85) p.push({ name:'polyfix.js.1.8.5' });
    if (be.name === 'ie' && parseInt(be.version) === 8) p.push({ name:'polyfix.ie.8' });
    p.push({ name:'core' });
    p.push({ name:'jquery-2.0.3.min' });
    p.push({ name:'fastclick' });
    p.push({ name:'highstock' });
    p.push({ name:'core.debug' });
    p.push({ name:'core.events' });
    p.push({ name:'core.stash' });
    p.push({ name:'core.store' });
    p.push({ name:'core.cache' });
    p.push({ name:'core.cordova' });
    // p.push({ name:'core.jsload' });
    p.push({ name:'core.url' });
    p.push({ name:'core.currency' });
    p.push({ name:'core.connection' });
    p.push({ name:'core.connection.xhr' });
    p.push({ name:'core.form.message' });
    p.push({ name:'core.oauth2' });
    p.push({ name:'binarycom', type:'css' });
    if (be.name === 'ie' && parseInt(be.version) === 8) { p.push({ name:'binarycom.fonts.eot', type:'css' }); }
    else { p.push({ name:'binarycom.fonts.otf', type:'css' }); }
    p.push({ name:'binarycom' });
    p.push({ name:'binarycom.status' });
    p.push({ name:'binarycom.apigee' });
    p.push({ name:'binarycom.api.offerings' });
    p.push({ name:'binarycom.charts.highstock' });
    p.push({ name:'binarycom.safety' });
    p.push({ name:'binarycom.navigate' });
    p.push({ name:'binarycom.sparkline' });
    p.push({ name:'binarycom.models.home' });
    p.push({ name:'binarycom.models.trade' });
    p.push({ name:'binarycom.models.charts' });
    p.push({ name:'binarycom.models.news' });
    p.push({ name:'binarycom.models.portfolio' });
    p.push({ name:'binarycom.models.support' });
    p.push({ name:'binarycom.models.settings' });
    
    var loading = document.querySelector('body .loading');
    
    // init plugins
    AppLoader({ root:'app', env:env, plugins:p, onProgress : function(p) {
	
	loading.querySelector('.wrapper >.progress >.wrapper >.percent').style.width = p.percent +'%';
	
    }, onAbort : function(o) {
	
	var loading = document.querySelector('body .loading .wrapper .progress .wrapper');
	loading.removeChild(loading.querySelector('.percent'));
	var abort = loading.querySelector('.abort');
	abort.style.display='block';
	var b;
	if (o.incompatible) b = abort.querySelector('.incompatible');
	else if (o.error) b = abort.querySelector('.error');
	b.style.display='block';

    }, onCompletion : function() {
	
	loading.parentNode.removeChild(loading);
	
	// debug listeners - events
	app['core.events'].listeners.add('core.debug.mode.set', function (o) {
	    if (! o) {
		var s = app['core.stash'].get('core.debug.events.init');
		if (s) s.forEach( function (b) { app['core.events'].listeners.remove(b); });
		return;	
	    }
	    var a = new Array();
	    a.push(app['core.events'].listeners.add('core.events.listeners.add', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:EVENTS:LISTENERS:ADD:'+o.event, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.events.listeners.remove', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:EVENTS:LISTENERS:REMOVE:'+o.event, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.events.dispatch', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:EVENTS:DISPATCH:'+o.event, type:'debug' }, false);
	    }));
	    app['core.stash'].set('core.debug.events.init', a);
	});
	
	// debug mode & append debug log to console
	app['core.events'].listeners.add('core.log.append', function (o) {
	    if (o.type !== 'debug') return;
	    if (typeof console !== 'undefined') console.log(o.message);
	});

	// debug listeners - other
	app['core.debug'].mode.set(app['core.store'].get({ id:'core.debug.mode' })? true : false);
	app['core.events'].listeners.add('core.debug.mode.set', function (o) {
	    app['binarycom.status'].append({ title:'Debug Mode '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
	    app['core.store'].set({ id:'core.debug.mode', value:o });
	    if (! o) {
		var s = app['core.stash'].get('core.debug.events');
		if (s) s.forEach( function (b) { app['core.events'].listeners.remove(b); });
		return;	
	    }
	    var a = new Array();
	    a.push(app['core.events'].listeners.add('core.connection.exec.data.json.error', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:CONNECTION:'+o.id+':JSON:ERROR: '+o.xhr.responseText, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.connection.exec.start', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:CONNECTION:'+o.id+':START: '+o.lastUrlRequest, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.connection.exec.end', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:CONNECTION:'+o.id+':END: '+o.xhr.responseText, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.oauth2.login.request', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:OAUTH2:LOGIN:REQUEST: '+o.url, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.oauth2.token.issued', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:OAUTH2:TOKEN: '+o.params.token, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.view.shown', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:VIEW:SHOWN: '+o.className, type:'debug' });
	    }));
	    a.push(app['core.events'].listeners.add('core.view.hidden', function (o) {
		app['core.events'].dispatch('core.log.append',{ message:'CORE:VIEW:HIDDEN: '+o.className, type:'debug' });
	    }));
	    app['core.stash'].set('core.debug.events', a);
	});
	
	// connection status icons
	app['core.events'].listeners.add('core.connection.exec.start', function (o) {
	    var s = o.status;
	    if (! s.nextto) return;
	    if (s.container && s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
	    s.container = document.createElement('div');
	    s.container.className = 'app-core-connection-xhr';
	    s.nextto.appendChild(s.container);
	    var icon = document.createElement('div');
	    icon.className = 'loading';
	    s.container.appendChild(icon);
	});
	var f = function (o) {
	    var s = o.status;
	    if (! s.nextto || ! s.container) return;
	    if (s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
	    s.container=null;
	}
	app['core.events'].listeners.add('core.connection.exec.aborted', f);
	app['core.events'].listeners.add('core.connection.exec.success', f);
	app['core.events'].listeners.add('core.connection.exec.error', function (o) {
	    var s = o.status;
	    if (! s.nextto || ! s.container) return;
	    s.container.firstChild.className = 'error';
	    setTimeout(function() {
		if (s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
		s.container=null; }
	    , 4000);
	});
	
	// cache
	app['core.cache'].mode.set(app['core.store'].get({ id:'core.cache.mode' }) === false? false : true);
	app['core.events'].listeners.add('core.cache.mode.set', function (o) {
	    app['core.store'].set({ id:'core.cache.mode', type:'local', value:o });
	    app['binarycom.status'].append({ title:'Caching '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
	});
	
	// safety confirmations
	app['binarycom.safety'].mode.set(app['core.store'].get({ id:'binarycom.safety.mode' } === false? false : true),true);
	app['core.events'].listeners.add('binarycom.safety.mode.set', function (o) {
	    app['binarycom.status'].append({ title:'Safety '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
	});
	
	// throw inbuilt alert for most html codes
	app['core.events'].listeners.add('core.connection.exec.error', function (o) {
	    app['core.connection'].active.remove(o);
	    var xhr = o.xhr;
	    var type = xhr.status === 401? 'critical' : 'warn';
	    var title = xhr.status === 0? 'Connection Failure' : xhr.status + ' ('+xhr.statusText+')';
	    app['binarycom.status'].append( { type:type, id:'error', title:title, lines:new Array(o.resource) });
	});
	
	// json errors always go to user
	app['core.events'].listeners.add('core.connection.exec.data.json.error', function (o) {
	    alert(o.err);
	});

	// previous login?
	var pl = app['binarycom.apigee'].status.get();
	if (pl) app['binarycom.status'].append({ title:'Credentials', lines : new Array('Using Previous Login: '+pl.login_id) });
	    
	// main visible
	document.querySelector('body .main').style.display='block';
	    
	// show home view
	app['binarycom.models.home'].init();

    }});
    
});