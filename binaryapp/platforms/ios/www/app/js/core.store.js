function AppPlugin(app) {

    app['core.store'] = {
        remove : function(o) {
            var type = o.type? o.type : 'local';
            var id = o.id;
            if (type === 'cookie') document.cookie = id + '=\'\';path=/;expires=Sun, 17-Jan-1980 00:00:00 GMT;\n';
            else if (type === 'local') return localStorage.setItem(id,null);
            else if (type === 'session') return sessionStorage.setItem(id,null);
            return true;
            
        },
        set : function (o) {
            var type = o.type? o.type : 'local';
            var value = JSON.stringify(o.value);
            var id = o.id;
            if (type === 'cookie') document.cookie = (nopersist)? id+'='+escape(value)+';path=/;\n' : id+'='+escape(value)+';path=/;expires=Sun, 17-Jan-2038 00:00:00 GMT;\n';
            else if (type === 'local') return localStorage.setItem(id,value);
            else if (type === 'session') return sessionStorage.setItem(id,value);
            return true;

        },
        get : function (o) {
            var id = o.id;
            var type = o.type? o.type : 'local';
            if (type === 'cookie') {
                id = id + '='; var j = -1; var done = false; var t;
                while ((j < document.cookie.length) && done == false) { j++;
                    if (document.cookie.substring(j, j + id.length) != id) continue;
                    var k = 0; var x = 'a';
                    while (x != '' && x != ';') { k++; x = document.cookie.substring(j + id.length + k, j + id.length + k - 1); }
                    t = unescape(document.cookie.substring(j + + id.length, j + id.length + k - 1));
                    done = true;
                }
                if (t) return t;
                return null;    
            }
            else if (type === 'local') return JSON.parse(localStorage.getItem(id));
            else if (type === 'session') return JSON.parse(sessionStorage.getItem(id));
            return null;
        }
    };

};

AppPluginLoaded=true;