function AppPlugin(app) {
    
    app['core.url'] = {
    
        param : {
            
            get : function(name, url) {
                if (! url) url = window.location.href;
                name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
                var regexS = "[\\?&]"+name+"=([^&#]*)";
                var regex = new RegExp(regexS);
                var results = regex.exec(url);
                return (results == null)? null:results[1];
            },
            replace : function(param,value,url) {
                if (! url) url = window.location.href;
                if (url.indexOf(param + "=") >= 0) {
                    var prefix = url.substring(0, url.indexOf(param));
                    var suffix = url.substring(url.indexOf(param)).substring(url.indexOf("=") + 1);
                    suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
                    url = prefix + param + "=" + value + suffix;
                } else {
                    url += url.indexOf("?") < 0? "?" + param + "=" + value : "&" + param + "=" + value;
                }
                return url;  		
            }
            
        },
    
        current : function(o) {
            var w = document.location.protocol;
            if (o && o.ssl === false) w = 'http:';
            if (o && o.ssl === true) w = 'https:';
            w += '//'+window.location.hostname;
            if (window.location.pathname.length && o && o.path !== false) w += window.location.pathname;
            if (window.location.search.length && o && o.search !== false) w += '?'+window.location.search;
            return w;
        }
    
    };
    
};

AppPluginLoaded=true;