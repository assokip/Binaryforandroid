window.addEventListener('load', function() {
    
    // modules -> [!] omit core.amd
    var path = 'file:///i/igaro/clients/RMG/binaryapp/www/app';

    var js = new Array();
    var jsmin = false;
	js.push({ name:'core', minified:jsmin });
    js.push({ name:'jquery', minified:true });
    js.push({ name:'jquery.sparkline', minified:true, requires:['jquery'] });
    js.push({ name:'fastclick', minified:jsmin });
    js.push({ name:'highstock', requires:['jquery'] });
    js.push({ name:'core.debug', minified:jsmin });
    js.push({ name:'core.events', minified:jsmin });
    //js.push({ name:'core.stash', minified:jsmin });
    js.push({ name:'core.store', minified:jsmin });
    js.push({ name:'core.cache', minified:jsmin });
    js.push({ name:'core.cordova', minified:jsmin });
    js.push({ name:'core.url', minified:jsmin });
    js.push({ name:'core.currency', minified:jsmin });
    js.push({ name:'core.connection.xhr', minified:jsmin });
    js.push({ name:'core.form.message', minified:jsmin });
    js.push({ name:'core.auth.openstandard.2', minified:jsmin });
    js.push({ name:'binarycom.status', minified:jsmin });
    js.push({ name:'binarycom.apigee', minified:jsmin, requires:['core.auth.openstandard.2'] });
    js.push({ name:'binarycom.api.offerings', minified:jsmin, requires:['binarycom.apigee'] });
    js.push({ name:'binarycom.charts.highstock', minified:jsmin, requires:['highstock'] });
    js.push({ name:'binarycom.safety', minified:jsmin });
    js.push({ name:'binarycom.navigate', minified:jsmin });
    js.push({ name:'binarycom.models.home', minified:jsmin });
    js.push({ name:'binarycom.models.trade', minified:jsmin, requires:['binarycom.apigee', 'jquery.sparkline'] });
    js.push({ name:'binarycom.models.account', minified:jsmin });
    js.push({ name:'binarycom.models.news', minified:jsmin });
    js.push({ name:'binarycom.models.portfolio', minified:jsmin });
    js.push({ name:'binarycom.models.support', minified:jsmin });
    js.push({ name:'binarycom.models.settings', minified:jsmin, requires:['binarycom.apigee'] });

    var css = new Array();
    css.push({ name:'core.connection.xhr' });
    css.push({ name:'binarycom' });
    css.push({ name:'binarycom.status' });
	css.push({ name:'core.form.message' });
	
    var loading = document.querySelector('body .loading');
    var percent = loading.querySelector('.wrapper >.progress >.wrapper >.percent');
      
    var onError = function(e) {
		var progress = loading.querySelector('.wrapper >.progress >.wrapper');
		progress.removeChild(progress.querySelector('.percent'));
		var abort = progress.querySelector('.abort');
		abort.style.display='block';
        abort.querySelector('.'+(e && e.incompatible? 'incompatible' : 'error')).style.display='block';
        if (typeof console !== 'undefined' && e !== 'undefined') console.log(e);
    }
    
    if (typeof XMLHttpRequest === 'undefined') { onError({ incompatible:true, noobject:'XMLHttpRequest' }); return; }
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200 && ! (xhr.status === 0 && xhr.responseText)) { onError(xhr.status); return; }
        var app = {};
        try { var module={}; eval(xhr.responseText); module.exports(app); }
        catch (e) { onError(e); return; }

        percent.style.width = '1%';

        app['core.amd']({ onError:function(e) { onError(e) }, modules:new Array({ modules:css, type:'css', path:path+'/css' },{ modules:js, type:'js', path:path+'/js' }), onProgress : function(p) {
        
            percent.style.width = p+'%';
    
        }, onCompletion : function() {

            loading.parentNode.removeChild(loading);

            var events = app['core.events'];
        
            // debug listeners - events
            var debugEv = null;
            events.listeners.add('core.debug','mode.set', function (o) {
                if (!o && debugEv) {
                    events.listeners.remove(debugEv);
                    debugEv = null;
                    return;	
                }
                if (o) debugEv = events.listeners.add('core.events','dispatch', function (o) {
                    if (o.params && (('core.events' === o.params.name && o.params.event === 'dispatch') || ('core.debug' === o.params.name && o.params.event === 'log.append'))) return;
                    app['core.debug'].log.append(o.name,o.event,o.params);
                });
            });
            
            // connection status icons
            events.listeners.add('core.connection.xhr','start', function (o) {
                var s = o.status;
                if (! s.nextto) return;
                if (s.container && s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
                s.container = document.createElement('div');
                s.container.className = 'core-connection-xhr';
                s.nextto.appendChild(s.container);
                var icon = document.createElement('div');
                icon.className = 'loading';
                s.container.appendChild(icon);
            });
            var fk = function(o) {
                var s = o.status;
                if (! s.nextto || ! s.container) return;
                if (s.container.parentNode === s.nextto) s.nextto.removeChild(s.container);
                s.container=null;
            }
            events.listeners.add('core.connection.xhr','success', fk);
            events.listeners.add('core.connection.xhr','aborted', fk);
            events.listeners.add('core.connection.xhr','error', function (o) {
                if (! o.status.container) return;
                o.status.container.getElementsByTagName('div')[0].className='error';
                setTimeout(function() { fk(o); },4000);
            });
            
            // debug mode & append debug log to console
            events.listeners.add('core.debug','log.append', function (o) {
                if (typeof console !== 'undefined') console.log(o);
            });
            
            // debug listeners - other
            app['core.debug'].mode.set(app['core.store'].get('core.debug','mode') === true? true : false);
            events.listeners.add('core.debug','mode.set', function (o) {
                app['core.store'].set('core.debug','mode', o);
                app['binarycom.status'].append({ title:'Debug Mode '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
            });

            // view error handling
            events.listeners.add('core.connection.xhr','json.error', function (o) {
                var as = app['core.store'].get('core.debug','autosend');
                if (as === false) return;
                app['binarycom.status'].append({ title:'A problem has occured.', lines : new Array('Execution error.') });
                if (as === false) return;
                if (as !== false) {
                    if (confirm('A problem has occured while loading the resource.\n\nCan we submit details of this and future problems to our developers? No personal information will be transmitted.') === false) {
                        app['core.store'].set('core.debug','autosend',false);
                        return;
                    }
                }
                alert('Feature not implemented');
            });
    
            // cache
            app['core.cache'].mode.set(app['core.store'].get('core.cache','mode') === false? false : true);
            events.listeners.add('core.cache','mode.set', function (o) {
                app['core.store'].set('core.cache','mode', o);
                app['binarycom.status'].append({ title:'Caching '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
            });
            
            // confirmations
            app['binarycom.safety'].mode.set(app['core.store'].get('binarycom.safety','mode') !== false? true : false,true);
            events.listeners.add('binarycom.safety','mode.set', function (o) {
                app['binarycom.status'].append({ title:'Prompts '+(o? 'Enabled' : 'Disabled'), lines : new Array('Effective immediately.') });
            });
            
            // throw inbuilt alert for most html codes
            events.listeners.add('core.connection.xhr','error', function (o) {
                var xhr = o.xhr;
                var type = xhr.status === 401? 'critical' : 'warn';
                var title = xhr.status === 0? 'Connection Failure' : xhr.status + ' ('+xhr.statusText+')';
                app['binarycom.status'].append( { type:type, id:'error', title:title, lines:new Array(o.resource) });
            });
            
            // previous login?
            var pl = app['binarycom.apigee'].status.get();
            if (pl) app['binarycom.status'].append({ title:'Credentials', lines : new Array('Using Login: '+pl.login_id) });
            
            // main visible
            document.querySelector('body .main').style.display='block';
                
            // show home view
            app['binarycom.models.home'].init();

        }});
    }

    xhr.open('GET',path+'/js/core.amd.'+(jsmin? 'min.':'')+'js',true);
    xhr.send(null);

});