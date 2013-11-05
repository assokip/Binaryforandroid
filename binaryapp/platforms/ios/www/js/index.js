app = {

    debug:1,
    exe : 'https://rmg-prod.apigee.net/v1/binary',
    cordova : {
        loaded : window.cordova || window.PhoneGap? true : false
    },

    oauth2 : {

        status : document.querySelector('body >.wrapper >.connecting >.wrapper >.status >.wrapper'),
        devid : '3yqBdSJfFGIZELagj9VIt5cAr8tMknRA',
        scope : 'chart',
        url : 'https://andrewdev.binary.com/clientapp/oauth2',
        params : new Object(),

        init : function() {
            this.token = null;
            this.params = new Object();
            app.navigate.to({ view:document.querySelector('body >.wrapper >.connecting') });
            this.status.getElementsByClassName('init')[0].style.display='block';
            this.status.getElementsByClassName('stage1')[0].style.display='none';
            this.status.getElementsByClassName('stage2')[0].style.display='none';
            this.status.getElementsByClassName('error')[0].style.display='none';
        },

        stage1 : {
            exec : function() {
                var url = app.oauth2.url+'/login?scope='+app.oauth2.scope+'&client_id='+app.oauth2.devid;
                app.oauth2.status.getElementsByClassName('init')[0].style.display='none';
                app.oauth2.status.getElementsByClassName('stage1')[0].style.display='block';
                var ref = window.open(url, '_blank', 'location=no');
                var self=this;
                ref.addEventListener('loadstop', function(event) {
                    if (event.url === url) return;
                    var a = app.url.param.get('code',event.url);
                    ref.close();
                    app.oauth2.stage2.exec({ authcode:a });
                });
                //win.addEventListener('close', function(event) { app.exit(); });
            }
        },

        stage2 : {
            exec : function(o) {
                app.oauth2.status.getElementsByClassName('stage1')[0].style.display='none';
                app.oauth2.status.getElementsByClassName('stage2')[0].style.display='block';
                var connection = new igaro_connection({
                    exe: app.oauth2.url+'/tokenswap',
                    vars : { scope:app.oauth2.scope, code:o.authcode },
                    onCompletion : function(j) {
                        app.oauth2.params = j.params;
                        app.events.dispatch('security.oauth2.token.issued');
                        app.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
                        document.querySelector('body >.wrapper >.main >.wrapper >.login_id').innerHTML = j.params.login_id;
                    }
                });
                connection.run();
            }
        }
    },
    
    init : function() {
        var self=this;
        this.events.listeners.add('connection.exec.end', function (o) {
            if (o.xhr.status < 400) return;
            alert('['+o.xhr.status+'] '+o.xhr.statusText+'\n\n'+o.exe+o.resource);
        });
        this.events.listeners.add('connection.exec.end', function (o) {
            if (o.xhr.status !== 403 || o.xhr.exe !== app.exe) return;
            self.oauth2.init();
            self.oauth2.stage1.exec();
        });
        this.events.listeners.add('connection.exec.data.json.error', function (o) {
            alert(o.err);
        });
        if (this.debug) {
            this.events.listeners.add('connection.exec.data.json.error', function (o) {
                console.log('  CONNECTION::DATA::JSON:ERROR:\n'+o.xhr.responseText);
            });
            this.events.listeners.add('connection.exec.end', function (o) {
                console.log('  CONNECTION::DATA:'+o.resource+'\n\n'+o.xhr.responseText);
            });
        }
        self.oauth2.init();
        document.addEventListener('deviceready', function() { self.oauth2.stage1.exec(); }, false);
	this.events.listeners.add('exit', function() { app.exit() });
        if (! app.cordova.loaded) self.main.init();
	
	/* main */
        Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.main >.wrapper >.menu div')).forEach(function(v) {
            if (v.parentNode.className !== 'menu') return;
            if (v.className==='exit') v.addEventListener('click', function() { self.events.dispatch('exit'); });
            else v.addEventListener('click', function() { eval('app.'+this.className).init(); });
        });
	
	/* support */
	document.querySelectorAll('body >.wrapper >.support >.wrapper >.header >.back')[0].addEventListener('click', function() { self.main.init({ effect:'back' }); });
        Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
            if (v.parentNode.className !== 'menu') return;
            //if (v.className==='back') v.addEventListener('click', function() { self.main.init({ effect:'back' }); });
            else v.addEventListener('click', function() { eval('app.support.'+this.className).init(); });
        });
	
	/* portfolio */
	document.querySelectorAll('body >.wrapper >.portfolio >.wrapper >.header >.back')[0].addEventListener('click', function() { self.main.init({ effect:'back' }); });
	
	/* trade */
	document.querySelectorAll('body >.wrapper >.trade >.wrapper >.header >.back')[0].addEventListener('click', function() { self.main.init({ effect:'back' }); });
	
	/* charts */
	document.querySelectorAll('body >.wrapper >.charts >.wrapper >.header >.back')[0].addEventListener('click', function() { self.main.init({ effect:'back' }); });
	
	/* news */
	document.querySelectorAll('body >.wrapper >.news >.wrapper >.header >.back')[0].addEventListener('click', function() { self.main.init({ effect:'back' }); });
	
    },
    
    events : {
        listeners : {
            list :  new Array(),
            add : function(event, fn) {
                if (! this.list[event]) this.list[event] = [];
                if (!(fn in this.list) && fn instanceof Function) this.list[event].push(fn);
                if (app.debug) console.log('EVENTS:ADD:'+event);
            },
            remove : function(event, fn) {
                if (! this.list[event]) return;
                for (var i=0, l=this.list[event].length; i<l; i++) {
                    if (this.list[event][i] === fn) {
                        if (app.debug) console.log('EVENTS:REMOVE:'+event);
                        this.list[event].slice(i,1);
                        break;
                    }
                }
            }
        },
        dispatch : function(event, params) {
            if (! this.listeners.list[event]) return;
            for (var i=0, l=this.listeners.list[event].length; i<l; i++) {
                if (app.debug) console.log('EVENTS:DISPATCH:'+event);
                this.listeners.list[event][i].call(window, params);
            }
        }
    },  
    
    navigate : {
        
        current : null,
        
        to : function(o) {
            var view = o.view;
            var ic = Array.prototype.slice.call(view.parentNode.getElementsByTagName('div'));
            ic.forEach(function(v) {
                if (v.parentNode !== view.parentNode || view.className !== v.className) return;
                var c = v.className.split(' ');
                for(var i=0; i<c.length;i++) {
                    if (c[i].substr(0,7) !== 'effect_') continue;
                    c.splice(i,1);
                    break;
                }
                v.className = c.join(' ');
                if (o.effect) v.className += ' effect_'+o.effect;
                var c = this.current && this.current.style.zIndex? this.current.style.zIndex : 999;
                v.style.zIndex = c+1;
                v.style.visibility='visible';
                app.events.dispatch('view.shown',v.className);
                this.current = v;
            });
            var self=this;
            setTimeout( function() { ic.forEach(function(v) {
                if (this.current.parentNode === v.parentNode || v.parentNode !== view.parentNode) return;
                var c = v.className.split(' ');
                for(var i=0; i<c.length;i++) {
                    if (c[i].substr(0,7) !== 'effect_') continue;
                    c.splice(i,1);
                    break;
                }
                v.className = c.join(' ');
                v.style.visibility='hidden';
                v.style.zIndex=0;
                app.events.dispatch('view.hidden',v.className);
            }) }, 1000);
        }
    },

    exit : function() {
        navigator.app.exitApp();
    },

    url : {
	param : {
            get : function(name, url) {
                if (! url) url = window.location.href;
                name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
                var regexS = "[\\?&]"+name+"=([^&#]*)";
                var regex = new RegExp(regexS);
                var results = regex.exec(url);
                return (results == null)? null:results[1];
            }
        }
    },
    
    /* PANELS BELOW */

    main : {
        init : function(o) {
            var effect = o && o.effect? o.effect : 'into';
            app.navigate.to({ view:document.querySelector('body >.wrapper >.main'), effect:effect });
        }
    },
    
    trade : {
        init : function(o) {
            var effect = o && o.effect? o.effect : 'into';
            app.navigate.to({ view:document.querySelector('body >.wrapper >.trade'), effect:effect });
	    //document.querySelector('body >.wrapper >.trade >.wrapper >.content >.markets').innerHTML='';
	    var connection = new igaro_connection({
		resource: '/markets',
		headers : { 'Authorization': 'Bearer '+app.oauth2.params.token },
		onCompletion : function(j) {
		    app.events.dispatch('app.data.markets.revised');
		}
	    });
	    connection.run();
	    
        }
    },
    
    portfolio : {
        init : function() {
            app.navigate.to({ view:document.querySelector('body >.wrapper >.portfolio'), effect:'into' });
        }
    },
    
    support : {
        init : function() {
            app.navigate.to({ view:document.querySelector('body >.wrapper >.support'), effect:'into' });
        }
    },
    
    charts : {
        init : function() {
            app.navigate.to({ view:document.querySelector('body >.wrapper >.charts'), effect:'into' });
        }
    },
    
    news : {
        init : function() {
            app.navigate.to({ view:document.querySelector('body >.wrapper >.news'), effect:'into' });
        }
    }
};

function igaro_connection(o) {
    this.data = null;
    this.exe = o.exe? o.exe : app.exe;
    this.resource = o.resource? o.resource : '';
    this.action = o.action? o.action : 'GET';
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
    this.loading = false;
    this.status = { nextto : o.statusnextto, container: null };

    this.onCompletion = o.onCompletion? function(d) { o.onCompletion(d) } : null;
    this.autoretry = o.autoretry? o.autoretry : { attempts:-1, delay:4000 };
    
    this.abort = function() {
        this.loading=false;
        this.xhr.abort();
        if (! this.status.container) return;
        this.status.nextto.removeChild(this.status.container);
        this.status.container = null;
        app.events.dispatch('connection.exec.abort', this);
    };
    this.run = function() {
	
	if (this.loading) this.abort();
        var self = this;
        var u = new Array();
        for (key in self.vars.list) {
            u[u.length] = encodeURIComponent(key)+"="+encodeURIComponent(self.vars.list[key]);
        }
        var url = u.join('&');
       
        var t = self.exe + self.resource;
        if (self.action.toUpperCase()=='GET' && url.length) {
            t += (t.indexOf('?') > -1)? '&' : '?';
            t += url;
        }
        var xhr = self.xhr;
        xhr.open(self.action.toUpperCase(), t, true);
        if (self.form) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	for (key in self.headers.list) {
	    xhr.setRequestHeader(key, self.headers.list[key]);
        }
        xhr.onreadystatechange = function() {
            self.loading=false;
            if (xhr.readyState != 4) return;
            if (xhr.status === 200) {
                try { self.data = xhr.responseText.length? JSON.parse(xhr.responseText) : new Object; }
                catch(e) {
                    app.events.dispatch('connection.exec.data.json.error', { xhr:xhr, err:e }); }
                if (self.status.container) self.status.container.parentNode.removeChild(self.status.container);
                self.status.container=null;
                if (self.onCompletion) self.onCompletion(self.data);
            } else if (xhr.status === 302) {
                self.resource = '';
                self.run();
                return;
            } else {
                if (xhr.status === 0 && self.autoretry.attempts !== -1) { s = setTimeout(self.run,self.autoretry.delay); return; } // retry
                if (self.onFail) self.onFail();
                if (self.status.container) {
                    self.status.container.parentNode.removeChild(self.status.container);
                    self.status.container = null;
                }
            }
            app.events.dispatch('connection.exec.end', self);
        };
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
        app.events.dispatch('connection.exec.start', { api:self });
    };
};