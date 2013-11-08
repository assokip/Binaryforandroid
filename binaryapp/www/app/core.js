App = function() {
    
    var self = this;

    this.plugins = {
	
	load : function(p) {
	    
	    var root = p.root;
	    var plugins = p.plugins;
	    p.plugins.unshift('debug','events');
	    
	    /* load files */
	    var at=0;
	    var abort = false;
	    var loadt = function() {
		var o = document.createElement('script');
		o.type = 'text/javascript';
		o.src = root + '/plugins/' + plugins[at] + '.js';
		o.onload = o.onreadystatechange = function() {
		    if (o.done || (this.readyState && ! (this.readyState === "loaded" || this.readyState === "complete"))) return;
		    o.done = true;
		    AppPlugin(self);
		    at++;
		    o.onload = o.onreadystatechange = null; // IE memory leak fix
		    o.parentNode.removeChild(o);
		    if (at < plugins.length) {
			loadt();
		    } else {
			abort=true;
			p.onCompletion();
		    }
		}
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(o,s);
	    }
	    if (! abort) loadt();
	}
    
    };
    
    
};
