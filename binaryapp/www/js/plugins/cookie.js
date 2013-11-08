function AppPlugin(app) {

    app.cookie = {
        remove : function(name) { document.cookie = name + '=\'\';path=/;expires=Sun, 17-Jan-1980 00:00:00 GMT;\n'; },
        set : function (name, value, nopersist) {
            document.cookie = (nopersist)? name+'='+escape(value)+';path=/;\n' : name+'='+escape(value)+';path=/;expires=Sun, 17-Jan-2038 00:00:00 GMT;\n';
        },
        get : function (name,def) {
            name = name + '='; var j = -1; var done = false; var t;
            while ((j < document.cookie.length) && done == false) { j++;
                if (document.cookie.substring(j, j + name.length) != name) continue;
                var k = 0; var x = 'a';
                while (x != '' && x != ';') { k++; x = document.cookie.substring(j + name.length + k, j + name.length + k - 1); }
                t = unescape(document.cookie.substring(j + + name.length, j + name.length + k - 1));
                done = true;
            }
            if (t) return t; return def;
        }
    };

};