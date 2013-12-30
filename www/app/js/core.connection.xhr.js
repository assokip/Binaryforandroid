
module.exports = function(app) {

    if (typeof XMLHttpRequest === 'undefined') throw new Error({ incompatible:true, noobject:'XMLHttpRequest' });
    
    var ccx = app['core.connection.xhr'] = function (o) {
        var self = this;
        this.data = null;
        this.exe = o.exe? o.exe : null;
        this.resource = o.resource? o.resource : '';
        this.action = o.action? o.action : 'GET';
        this.cors = {
            withCredentials: o.withCredentials? o.withCredentials : null
        },
        this.id = Math.floor((Math.random()*9999)+1),
        this.form = {
            current : null,
            set : function(form) {
                self.action = 'POST';
                for(var i=0; i<form.elements.length; i++) {
                    if(form.elements[i].disabled) continue;
                    if(form.elements[i].type=="checkbox" && form.elements[i].checked) {
                        self.vars.set(form.elements[i].name, form.elements[i].checked? 1:0);
                    } else if(form.elements[i].type=="select-one" && form.elements[i].selectedIndex > -1) {
                        if (form.elements[i].options.length) self.vars.set(form.elements[i].name,form.elements[i].options[form.elements[i].selectedIndex].value);
                    } else if(form.elements[i].type=="select-multiple") {
                    var t='';
                    for (var k=0; k < form.elements[i].options.length; k++) {
                        if (! form.elements[i].options[k].selected) continue;
                        if (t.length) t += '\n';
                        t += form.elements[i].options[k].value;
                    }
                    if (t.length) self.vars.set(form.elements[i].name, t);
                    } else if (form.elements[i].type=="hidden" || form.elements[i].type=="password" || form.elements[i].type=="text" || form.elements[i].type=="radio" || form.elements[i].type=="textarea") {                  
                        self.vars.set(form.elements[i].name, form.elements[i].value.trim());
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
        this.status = { nextto : o.statusnextto?o.statusnextto:null };
        this.onCompletion = o.onCompletion? o.onCompletion : null;
        this.onError = o.onError? function(e) { o.onError({ obj:this, error:e }) } : null;
        this.onEnd = o.onEnd? o.onEnd : null;
        this.json = {
            parse : 'jsonParse' in o? o.jsonParse: true,
            error : null
        };
        xhr.onreadystatechange = function() {
            if (xhr.readyState !== 4) return;
            if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                var ok=false;
                if (self.json.parse) {
                    try {
                        self.data = JSON.parse(xhr.responseText);
                        ok=true;
                    }
                    catch(e) {
                        self.json.error = e;
                        app['core.events'].dispatch('core.connection.xhr','json.error', self);
                    }
                } else {
                    self.data = xhr.responseText;
                    ok=true;
                }
                if (ok) {
                    if (self.onCompletion) self.onCompletion(self.data);
                    app['core.events'].dispatch('core.connection.xhr','success', self);
                }
            } else {
                if (self.onError) self.onError(self);
                app['core.events'].dispatch('core.connection.xhr','error', self);
            }
            app['core.events'].dispatch('core.connection.xhr','end', self);
            if (self.onEnd) self.onEnd();
        }
        app['core.events'].dispatch('core.connection.xhr','created',this);
    }

    ccx.prototype.run = function() {
        var xhr = this.xhr;
        if (xhr.readyState !== 0) this.abort();
        this.data=null;
        this.json.error=null;
        if ("withCredentials" in xhr) xhr.withCredentials = this.cors.withCredentials? true : false;
        var u = new Array();
        for (key in this.vars.list) {
            u[u.length] = encodeURIComponent(key)+"="+encodeURIComponent(this.vars.list[key]);
        }
        var url = u.join('&');
        this.lastUrlRequest = this.exe + this.resource;
        if (this.action.toUpperCase()==='GET' && url.length) {
            this.lastUrlRequest += (this.lastRanURL.indexOf('?') > -1)? '&' : '?';
            this.lastUrlRequest += url;
        }
        xhr.open(this.action.toUpperCase(), this.lastUrlRequest, true);
        if (this.form) xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        for (var key in this.headers.list) {
            xhr.setRequestHeader(key, this.headers.list[key].call());
        }
        app['core.events'].dispatch('core.connection.xhr','start', this);
        xhr.send((this.action==='POST')? url : null);
    };

    ccx.prototype.abort = function() {
        if (this.xhr.readState === 0) return;
        this.xhr.abort();
        app['core.events'].dispatch('core.connection.xhr','aborted', this);
        if (this.onEnd) this.onEnd();
    };

};