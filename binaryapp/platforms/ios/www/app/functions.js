AppEnv = function() {
    
    var ua = navigator.userAgent;
    var e = null;
    var b = null;
    var v = null;
    
    if (/MSIE ([^;]+)/.test(ua)) {
        e='ie';
    } else if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(ua)){    
        e = 'gecko';
    } else if (/AppleWebKit\/(\S+)/.test(ua)) {
        e = 'webkit';
    }
    v = parseFloat(RegExp["$1"]);
    
    var js=1.5;
    if (Array.prototype.map) js = 1.6;
    if (String.prototype.trim) js = 1.81;
    if (Function.prototype.bind) js = 1.85;
   
    return {
        browser : {
            engine: {
                name:e,
                version:v,
            },
            js: {
                version:js
            }
        }
    }

};


AppLoader = function(p) {
    var root = p.root;
    var plugins = p.plugins;
    var at=0;
    var abort = false;
    var loadt = function() {
	var plugin = plugins[at];
	var type = plugin.type? plugin.type : 'js';
	var o = type === 'js'? document.createElement('script') : document.createElement('link');
	o.setAttribute('type', 'text/'+ (type === 'js'? 'javascript' : 'css'));
        if (type === 'css') o.setAttribute('rel', 'stylesheet');
        var file = root + '/'+type+'/' + plugin.name + '.' +type;
        if (type === 'js') { o.src = file; }
        else { o.href = file; }
	o.onload = o.onreadystatechange = function() {
	    if (o.done || (this.readyState && ! (this.readyState === "loaded" || this.readyState === "complete"))) return;
	    o.done = true;
	    if (type === 'js') {
		var r = AppPlugin(app,p.env);
		if (typeof r === 'object' && r.abort) {
		    abort=true;
		    p.onAbort({ reason:r.abort });
		}
	    }
	    o.onload = o.onreadystatechange = null; // IE memory leak fix
	    if (type === 'js') o.parentNode.removeChild(o);
	    if (abort) return;
	    at++;
	    if (p.onProgress) p.onProgress({ percent:100-(Math.round((at/plugins.length-1)*-100)) });
	    if (at < plugins.length) {
		loadt();
	    } else {
		abort=true;
		p.onCompletion();
	    }
	}
	AppPlugin = function() {}; // wipe
	var s = document.getElementsByTagName('head')[0];
	s.parentNode.insertBefore(o,s);
        
        if (type === 'css') { // horrible hack
            var img = document.createElement('img');
            img.onerror = o.onload;
            img.src = file;
        }
        
    }
    if (! abort) loadt();
};
