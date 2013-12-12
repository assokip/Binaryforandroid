function AppPlugin(app) {
    
    app['core.jsLoad'] = function(o) {
        var e = document.createElement('script');
        e.type = 'text/javascript';
        e.src = o.file;
        e.onload = e.onreadystatechange = function() {
            if (e.done || (this.readyState && ! (this.readyState === "loaded" || this.readyState === "complete"))) return;
            e.done = true;
            if (o && o.onLoad) o.onLoad();
            // Handle memory leak in IE
            e.onload = e.onreadystatechange = null;
            e.parentNode.removeChild(e);
        };
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(e,s);
    };

};