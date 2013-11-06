(function() {
    
    var plugins = new Array(null,'cordova','views','oauth2');
    var folder = 'js/';
    
    /* load custom config */
    var configure = function () {
     
        app = new App({ exe:'https://rmg-prod.apigee.net/v1/binary' });
        
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
        
        function ready ()  {
            
            // init oauth2
            if (! app.cordova.loaded) document.body.appendChild(document.createElement('iframe'));
            var status = document.querySelector('body >.wrapper >.connecting >.wrapper >.status >.wrapper');
            App.navigate.to({ view:document.querySelector('body >.wrapper >.connecting') });
	    status.getElementsByClassName('init')[0].style.display='block';
	    status.getElementsByClassName('stage1')[0].style.display='none';
	    status.getElementsByClassName('stage2')[0].style.display='none';
	    status.getElementsByClassName('error')[0].style.display='none';
            
            var oauth2 = app.oauth2.create({
                devid:'3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
                scope:'chart',
                base: 'https://www.binary.com/clientapp/oauth2'
            });
            
            oauth2.stage1({ into: });
    
            /* main */
            Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.main >.wrapper >.menu div')).forEach(function(v) {
                if (v.parentNode.className !== 'menu') return;
                if (v.className==='exit') v.addEventListener('click', function() { app.events.dispatch('exit'); });
                else v.addEventListener('click', function() { eval('app.'+this.className).init(); });
            });
            
            /* support */
            document.querySelectorAll('body >.wrapper >.support >.wrapper >.header >.back')[0].addEventListener('click', function() { app.main.init({ effect:'back' }); });
            Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
                if (v.parentNode.className !== 'menu') return;
                //if (v.className==='back') v.addEventListener('click', function() { app.main.init({ effect:'back' }); });
                else v.addEventListener('click', function() { eval('app.support.'+this.className).init(); });
            });
            
            /* portfolio */
            document.querySelectorAll('body >.wrapper >.portfolio >.wrapper >.header >.back')[0].addEventListener('click', function() { app.main.init({ effect:'back' }); });
            
            /* trade */
            document.querySelectorAll('body >.wrapper >.trade >.wrapper >.header >.back')[0].addEventListener('click', function() { app.main.init({ effect:'back' }); });
            
            /* charts */
            document.querySelectorAll('body >.wrapper >.charts >.wrapper >.header >.back')[0].addEventListener('click', function() { app.main.init({ effect:'back' }); });
            
            /* news */
            document.querySelectorAll('body >.wrapper >.news >.wrapper >.header >.back')[0].addEventListener('click', function() { app.main.init({ effect:'back' }); });
            
        };
    
        // no cordova, webpage?
        if (app.cordova.loaded) {
           document.addEventListener('deviceready', function () { ready(); });
        } else {
            window.addEventListener('load', function() { ready(); });
        }
    };    
    
    /* load plugins */
    var at=0;
    var loadnext = function() {
        var o = document.createElement('script');
        o.type = 'text/javascript';
        o.src = folder + 'main' + (plugins[at] === null? '' : '.'+plugins[at]) + '.js';
        o.onload = o.onreadystatechange = function() {
            if (o.done || (this.readyState && ! (this.readyState === "loaded" || this.readyState === "complete"))) return;
            o.done = true;
            at++;
            o.onload = o.onreadystatechange = null; // IE memory leak fix
            o.parentNode.removeChild(o);
            if (at < plugins.length) {
                loadnext();
            } else {
                configure();
            }
        }
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(o,s);
    }
    loadnext();
})();
