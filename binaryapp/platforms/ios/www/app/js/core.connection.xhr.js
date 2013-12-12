function AppPlugin(app) {

    if (typeof XMLHttpRequest === 'undefined') return;

    app['core.connection'].types['xhr'] = function (o) {
	var self = this;
	this.data = null;
	this.exe = o.exe? o.exe : null;
	this.resource = o.resource? o.resource : '';
	this.action = o.action? o.action : 'GET';
	this.cors = o.cors? o.cors : null;
	this.id = Math.floor((Math.random()*9999)+1),
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
	    list : o.vars? o.vars : {},
	    set : function(name,value) { this.list[name]=value; }
	};
	this.headers = {
	    list : o.headers? o.headers : {},
	    set : function(name,value) { this.list[name]=value; }
	}
	this.xhr = new XMLHttpRequest();
	var xhr = this.xhr;
	if (this.cors && o.cors.enabled) { // * CORS
	    if (typeof XDomainRequest !== "undefined") xhr = new XDomainRequest();
	    if ("withCredentials" in xhr) xhr.withCredentials = true; 
	}
	this.loading = false;
	this.status = { nextto : o.statusnextto?o.statusnextto:null };
	this.onCompletion = o.onCompletion? function(d) { o.onCompletion(d) } : null;
        this.onEnd = o.onEnd? function() { o.onEnd() } : null;
	this.autoretry = o.autoretry? o.autoretry : { attempts:-1, delay:4000 };
	this.abort = function() {
            xhr.abort();
            if (! this.loading) return;
	    this.loading=false;
	    app['core.events'].dispatch('core.connection.exec.aborted', this);
            if (self.onEnd) self.onEnd();
	};
	if (! ('onload' in xhr) && 'onreadystatechange' in xhr) { //xhr1 compat
	    xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) xhr.onload();
            else if (xhr.readyState === 0) xhr.onerror({ fatal:true });
	    };
	}
	xhr.onload = function() {
	    self.loading=false;
	    if (xhr.status === 200) {
                try { self.data = xhr.responseText.length? JSON.parse(xhr.responseText) : new Object; }
                catch(e) { app['core.events'].dispatch('core.connection.exec.data.json.error', { xhr:xhr, err:e }); }
                if (self.onCompletion) self.onCompletion(self.data);
                app['core.events'].dispatch('core.connection.exec.success', self);
            } else if (xhr.status === 302) {
                self.resource = '';
                self.run();
                app['core.events'].dispatch('core.connection.exec.success', self);
	    } else {
                if ((! o || ! o.fatal) && xhr.status === 0 && self.autoretry.attempts !== -1) { s = setTimeout(self.run,self.autoretry.delay); return; } // retry
                if (self.onError) self.onError();
                app['core.events'].dispatch('core.connection.exec.error', self);
	    }
	    app['core.events'].dispatch('core.connection.exec.end', self);
            if (self.onEnd) self.onEnd();
	};
	xhr.onerror = function(o) {
	    self.loading=false;
	    if ((! o || ! o.fatal) && xhr.status === 0 && self.autoretry.attempts !== -1) { s = setTimeout(self.run,self.autoretry.delay); return; } // retry
	    if (self.onError) self.onError();
	    app['core.events'].dispatch('core.connection.exec.error', self);
            app['core.events'].dispatch('core.connection.exec.end', self);
            if (self.onEnd) self.onEnd();
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
	    if (self.form) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
	    xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	    for (var key in self.headers.list) {
		xhr.setRequestHeader(key, self.headers.list[key].call());
	    }
	    self.loading=true;
	    app['core.events'].dispatch('core.connection.exec.start', self);
	    xhr.send((this.action==='POST')? url : null);

        };
    };

};

AppPluginLoaded=true;