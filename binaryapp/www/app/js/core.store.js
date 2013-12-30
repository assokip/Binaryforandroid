module.exports = function(app) {

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
        
        this.remove = function(name,id,o) {
            var type = o && o.type? o.type : 'local';
            var uid = name+':'+id; 
            if (type === 'cookie') document.cookie = uid + '=\'\';path=/;expires=Sun, 17-Jan-1980 00:00:00 GMT;\n';
            else if (type === 'local') return localStorage.setItem(uid,null);
            else if (type === 'session') return sessionStorage.setItem(uid,null);
            return true;
            
        };
        this.set = function (name,id,value,o) {
            var type = o && o.type? o.type : 'local';
            value = this.lzw.encode(JSON.stringify(value));
            var uid = name+':'+id; 
            if (type === 'cookie') {
                document.cookie = uid +'='+(nopersist? +escape(value)+';path=/;\n' : escape(value)+';path=/;expires=Sun, 17-Jan-2038 00:00:00 GMT;\n');
            } else if (type === 'local') {
                try { return localStorage.setItem(uid,value); } catch (e) { return e; }
            } else if (type === 'session') {
                try { return sessionStorage.setItem(uid,value); } catch (e) { return e; }
            }
            app['core.events'].dispatch('core.store','set', { name:name, id:id, value:value });
            return true;
        };
        this.get = function (name,id,o) {
            id = name+':'+id; 
            var type = o && o.type? o.type : 'local';
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
            else if (type === 'local') {
                try { return JSON.parse(this.lzw.decode(localStorage.getItem(id))); }
                catch (e) { app['core.debug'].log.append({ module:'core.store', action:'get', error:e }) }
            }
            else if (type === 'session') {
                try { return JSON.parse(this.lzw.decode(sessionStorage.getItem(id))); }
                catch (e) { app['core.debug'].log.append({ module:'core.store', action:'get', error:e }) }
            }
            return null;
        };
    };

};