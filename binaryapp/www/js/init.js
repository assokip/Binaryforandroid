(function() {
    
    /* leave this line alone */
    var plugins = new Array('../core');
    
    /* root level */
    var root = 'js';
    
    /* plugins here */
    plugins.push(
	'stash',
	'cordova',
	'jsload',
	'cookie',
	'status',
	'url',
	'currency',
	'connection',
	'connection.xhr',
	'form',
	'form.message',
	'oauth2'
    );
    
    /* load files */
    plugins.push('../program');
    var at=0;
    var load = function() {
        var o = document.createElement('script');
        o.type = 'text/javascript';
        o.src = root + '/plugins/' + plugins[at] + '.js';
        o.onload = o.onreadystatechange = function() {
            if (o.done || (this.readyState && ! (this.readyState === "loaded" || this.readyState === "complete"))) return;
            o.done = true;
            at++;
            o.onload = o.onreadystatechange = null; // IE memory leak fix
            o.parentNode.removeChild(o);
            if (at < plugins.length) load();
        }
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(o,s);
    }
    load();
})();
