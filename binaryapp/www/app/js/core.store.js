function AppPlugin(app) {
    
    app['core.store'] = new function() {
        
        this.lzw = {
            encode : function(s) {
                var dict = {};
                var data = (s + "").split("");
                var out = [];
                var currChar;
                var phrase = data[0];
                var code = 256;
                for (var i=1; i<data.length; i++) {
                    currChar=data[i];
                    if (dict[phrase + currChar] != null) {
                        phrase += currChar;
                    }
                    else {
                        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                        dict[phrase + currChar] = code;
                        code++;
                        phrase=currChar;
                    }
                }
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                for (var i=0; i<out.length; i++) {
                    out[i] = String.fromCharCode(out[i]);
                }
                return out.join("");
            }, 
            
            decode : function(s) {
                var dict = {};
                var data = (s + "").split("");
                var currChar = data[0];
                var oldPhrase = currChar;
                var out = [currChar];
                var code = 256;
                var phrase;
                for (var i=1; i<data.length; i++) {
                    var currCode = data[i].charCodeAt(0);
                    if (currCode < 256) {
                        phrase = data[i];
                    }
                    else {
                       phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                    }
                    out.push(phrase);
                    currChar = phrase.charAt(0);
                    dict[code] = oldPhrase + currChar;
                    code++;
                    oldPhrase = phrase;
                }
                return out.join("");
            }
        },
        
        this.remove = function(o) {
            var type = o.type? o.type : 'local';
            var id = o.id;
            if (type === 'cookie') document.cookie = id + '=\'\';path=/;expires=Sun, 17-Jan-1980 00:00:00 GMT;\n';
            else if (type === 'local') return localStorage.setItem(id,null);
            else if (type === 'session') return sessionStorage.setItem(id,null);
            return true;
            
        };
        this.set = function (o) {
            var type = o.type? o.type : 'local';
            var value = this.lzw.encode(JSON.stringify(o.value));
            var id = o.id;
            if (type === 'cookie') {
                document.cookie = (nopersist)? id+'='+escape(value)+';path=/;\n' : id+'='+escape(value)+';path=/;expires=Sun, 17-Jan-2038 00:00:00 GMT;\n';
            } else if (type === 'local') {
                try { return localStorage.setItem(id,value); } catch (e) { return e; }
            } else if (type === 'session') {
                try { return sessionStorage.setItem(id,value); } catch (e) { return e; }
            }
            return true;
        };
        this.get = function (o) {
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
                if (t) return this.lzw.decode(t);
                return null;    
            }
            else if (type === 'local') return JSON.parse(this.lzw.decode(localStorage.getItem(id)));
            else if (type === 'session') return JSON.parse(this.lzw.decode(sessionStorage.getItem(id)));
            return null;
        };
    };

};

AppPluginLoaded=true;