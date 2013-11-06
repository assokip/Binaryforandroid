App = function(o) {
    
    var _app = this;
    
    this.exe = o.exe? o.exe : null;

    this.debug = {
	value : o.debug? o.debug : false,
	set : function(o) {
	    this.value = o? true: false;
	    _app.events.dispatch('debug.mode.toggled', this.value);
	},
	get : function() { return this.value; },
    };
    
    this.file = {
	script : {
	    load : function(o) {
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
	    }
	}
    };
    
    this.events = {
        listeners : {
            list : new Object(),
            add : function(event, fn) {
                if (! this.list[event]) this.list[event] = new Array();
                if (!(fn in this.list[event]) && fn instanceof Function) this.list[event].push(fn);
                if (_app.debug.get()) _app.events.dispatch('log.append','EVENTS:ADD:'+event);
            },
            remove : function(event, fn) {
                if (! this.list[event]) return;
                for (var i=0, l=this.list[event].length; i<l; i++) {
                    if (this.list[event][i] === fn) {
                        if (_app.debug.get()) _app.events.dispatch('log.append','EVENTS:REMOVE:'+event);
                        this.list[event].slice(i,1);
                        break;
                    }
                }
            }
        },
        dispatch : function(event, params) {
            if (! this.listeners.list[event]) return;
            for (var i=0, l=this.listeners.list[event].length; i<l; i++) {
                if (_app.debug.get()) _app.events.dispatch('log.append','EVENTS:DISPATCH:'+event);
                this.listeners.list[event][i].call(window, params);
            }
        }
    };
    
    this.form = {
	message : {
	    list : new Object(),
	    show : function(o) {
		this.clear(o.form);
		var obj = o.near;
		var t = document.createElement('div');
		t.className='apmessage';
		t.style.left=obj.offsetLeft + 'px';
		t.style.top= ((obj.type=='select-one'? obj.offsetHeight : obj.clientHeight)+obj.offsetTop) + 'px';
		t.innerHTML = o.msg;
		o.form.appendChild(t);
		o.form.style.position='relative';
		if (! this.list[o.form]) this.list[o.form] = { onsubmit:null, msgobj:null };
		var self = this;
		if (! this.list[o.form].onsubmit) {
		    this.list[o.form].onsubmit = o.form.addEventListener('submit', function() { self.clear(this) });
		    var e = o.form.elements;
		    for (var i=0; i < e.length; i++) {
			e[i].addEventListener('oninput' in e[i]? 'input' : 'change',function() { self.clear(o.form) });
		    };
		}
		this.list[o.form].msgobj = t;
	    },
	    clear : function(form) {
		if (this.list[form] && this.list[form].msgobj) {
		    form.removeChild(this.list[form].msgobj);
		    this.list[form].msgobj = null;
		}
	    }
	},
    };
    
    this.cookie = {
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
    
    this.currency = {
	validate : function(s,o) {
	    if (o && o.allowneg) return RegExp(/^-?\d+(\.\d{2})?$/).test(String(s).trim());
	    return RegExp(/^\d+(\.\d{2})?$/).test(String(s).trim());
	},
	decimalise : function(o) {
	    o = Math.round(parseFloat(o)*100)/100;
	    o = o+'';
	    if (o.indexOf('.') == -1) return o+'.00';
	    if (o.substr(o.length-2,1) == '.') return o+'0';
	    return o;
	}
    };
    
    this.url = {
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

    this.status = {
        events : new Array(),
        remove : function(l) {
	    if (l) {
		var i = this.events.indexOf(l);
		if (i === -1) return;
		this.events.splice(i,1);
	    } else {
		this.events.length=0;
	    }
        },
	append : function(i) {
	    this.events.push(i);
	}
    };

    this.connection = {
	types : new Object(),
        pool : new Array(),
        count : function() { return this.pool.length },
        active : {
            pool : new Array(),
            count : function() { return this.pool.length },
            add : function(o) { this.pool.push(o) },
            remove : function(o) { this.pool.splice(this.pool.indexOf(o), 1); }
        },
        create : function(o) {
	    if (! o || ! o.exe) o.exe = _app.exe;
	    o._app = _app;
            var c = new conxhr342afd(o);
            _app.events.dispatch('connection.created',c);
            _app.connection.pool.push(c);
            return c;
        },
        remove : function(o) {
            _app.events.dispatch('connection.removed',o);
            this.pool.splice(this.pool.indexOf(o), 1);
        },
        abort : function(o) {
            var i = this.pool.indexOf(o);
            if (i===-1) return;
            this.pool[i].abort();
        }
    };

};

var conxhr342afd = function (o) {
    var self = this;
    var _app = o._app;
    this.data = null;
    this.exe = o.exe;
    this.resource = o.resource? o.resource : '';
    this.action = o.action? o.action : 'GET';
    this.cors = o.cors? o.cors : null;
    this.form = {
        current : null,
        _self : this,
        set : function(form) {
            this._self.action = 'POST';
            for(var i=0; i<form.elements.length; i++) {
                if(form.elements[i].disabled) continue;
                if(form.elements[i].type=="checkbox" && form.elements[i].checked) {
                    this._self.vars.set(form.elements[i].name, form.elements[i].checked? 1:0);
                } else if(form.elements[i].type=="select-one" && form.elements[i].selectedIndex > -1) {
                    if (form.elements[i].options.length) this._self.vars.set(form.elements[i].name,form.elements[i].options[form.elements[i].selectedIndex].value);
                } else if(form.elements[i].type=="select-multiple") {
                    var t='';
                    for (var k=0; k < form.elements[i].options.length; k++) {
                        if (! form.elements[i].options[k].selected) continue;
                        if (t.length) t += '\n';
                        t += form.elements[i].options[k].value;
                    }
                    if (t.length) this._self.vars.set(form.elements[i].name, t);
                } else if (form.elements[i].type=="hidden" || form.elements[i].type=="password" || form.elements[i].type=="text" || form.elements[i].type=="radio" || form.elements[i].type=="textarea") {                  
                    this._self.vars.set(form.elements[i].name, form.elements[i].value.trim());
                }
            }
        }
    };
    if (o.form) this.form.set(o.form);
    this.vars = {
        list : o.vars? o.vars : new Object(),
        set : function(name,value) { this.list[name]=value; }
    };
    this.headers = {
        list : o.headers? o.headers : new Object(),
        set : function(name,value) { this.list[name]=value; }
    }
    this.xhr = new XMLHttpRequest();
    var xhr = this.xhr;
    if (this.cors && o.cors.enabled) { // * CORS
	if (typeof XDomainRequest !== "undefined") xhr = new XDomainRequest();
	if (this.cors.credentials && this.cors.credentials.send && "withCredentials" in xhr) xhr.withCredentials = true; 
    }
    this.loading = false;
    this.status = { nextto : o.statusnextto, container: null };
    this.onCompletion = o.onCompletion? function(d) { o.onCompletion(d) } : null;
    this.autoretry = o.autoretry? o.autoretry : { attempts:-1, delay:4000 };
    this.abort = function() {
        this.loading=false;
        if ('abort' in xhr) xhr.abort();
        if (! this.status.container) return;
        this.status.nextto.removeChild(this.status.container);
        this.status.container = null;
        _app.events.dispatch('connection.exec.abort', this);
    };
    if (! ('onload' in xhr) && 'onreadystatechange' in xhr) { //xhr1 compat
	xhr.onreadystatechange = function() {
	    if (xhr.readyState === 4) xhr.onload();
	    else if (xhr.readyState === 0) xhr.onerror({ fatal:true });
	};
    }
    xhr.onload = function() {
	self.loading=false;
	if (self.status.container) {
	    self.status.container.parentNode.removeChild(self.status.container);
	    self.status.container=null;
	} 
	if (xhr.status === 200) {
	    try { self.data = xhr.responseText.length? JSON.parse(xhr.responseText) : new Object; }
	    catch(e) { _app.events.dispatch('connection.exec.data.json.error', { xhr:xhr, err:e }); }
	    if (self.onCompletion) self.onCompletion(self.data);
	} else if (xhr.status === 302) {
	    self.resource = '';
	    self.run();
	}
	_app.events.dispatch('connection.exec.end', self);
    };
    xhr.onerror = function(o) {
	self.loading=false;
	if ((! o || ! o.fatal) && xhr.status === 0 && self.autoretry.attempts !== -1) { s = setTimeout(self.run,self.autoretry.delay); return; } // retry
	if (self.onError) self.onError();
	_app.events.dispatch('connection.exec.error', self);
    };
    this.run = function() {
	if (this.loading) this.abort();
        var u = new Array();
        for (key in self.vars.list) {
            u[u.length] = encodeURIComponent(key)+"="+encodeURIComponent(self.vars.list[key]);
        }
        var url = u.join('&');
        self.lastUrlRequest = self.exe + self.resource;
        if (self.action.toUpperCase()==='GET' && url.length) {
            self.lastUrlRequest += (self.lastRanURL.indexOf('?') > -1)? '&' : '?';
            self.lastUrlRequest += url;
        }
        var xhr = self.xhr;
        xhr.open(self.action.toUpperCase(), self.lastUrlRequest, true);
        if (self.form) xhr.setRequestHeader("Content-Type", "_application/x-www-form-urlencoded;charset=utf-8");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	for (key in self.headers.list) {
	    xhr.setRequestHeader(key, self.headers.list[key]);
        }
        self.loading=true;
        xhr.send((this.action==='POST')? url : null);
        var s = this.status;
        if (! s.container && s.nextto) {
            s.container = document.createElement('div');
            s.container.className = 'ajax';
            s.nextto.appendChild(s.container);
            var icon = document.createElement('div');
            s.container.appendChild(icon);
        }
        if (s.container) s.container.getElementsByTagName('div')[0].className = 'loading';
        _app.events.dispatch('connection.exec.start', self);
    };
};




