/*
binary.api.get({ resource:'/trades/list', statusnextto:document.getElementById('tradeicon'), onComplete:function(o) { alert(JSON.stringify(o.data)); } })
*/

binary = {
    
    debug:true,
    
    session : {
	token : null
    },
    
    init : function() {
	this.view.fetch({ id:'home'});
    },
    
    view: {
	header : {
	    obj : document.createElement('div'),
	    hide : function() {
		this.obj.style.display='none';
	    },
	    show : function() {
		this.obj.style.display='block';
	    }
	},
	content : {
	    obj : document.createElement('div')
	},
	footer : {
	    obj : document.createElement('div')
	},
	fetch : function(o) {
	    var p = o.into? o.into : this.content.obj;
	    if (o.clear) p.innerHTML='';
	    $.get('views/'+o.id+'.html', function(q) { $(p).html(q); }, 'html');
	}
    }, 
    
    api : {
        exe : 'https://paveldev.regentmarkets.com/api/?',
        loading : new Array(),
        connect : function(o) {
            var j = this.loading.length;
	    // resubmitted?
	    for(var i=0; i < this.loading.length; i++) {
		if (this.loading[i].resource == o.name) {
		    this.loading[i].xhr.abort();
		    j=i;
		    break;
		}
	    };
	    var self = this;
	    o.onCompletion = function(w) { w.apihandle = self.loading[j]; o.onCompletion(w); }
            this.loading[j] = new binary_api(o);
            this.loading[j].run();
            return this.loading[j];
        }
    }
};


function binary_api(o) {
    this.xhr = new XMLHttpRequest();
    this.vars = new Object();
    this.status = null;
    this.statusnextto = o.statusnextto;
    this.resource = (o.resource)? o.resource : '';
    this.exe = (o.exe)? o.exe : binary.api.exe;
    this.form = (o.form)? o.form : null;
    this.action = o.action? o.action : ((o.form)? 'POST' : 'GET');
    if (o.vars) this.vars = o.vars;
    if (o.onCompletion) this.onCompletion = o.onCompletion;
    if (o.form) {
	var name = o.form;
	for(var i=0; i<name.elements.length; i++) {
	    if(! name.elements[i].disabled) {
		if(name.elements[i].type=="checkbox" && name.elements[i].checked) {
		    this.vars[name.elements[i].name] = (name.elements[i].checked)? 1:0;
		} else if(name.elements[i].type=="select-one" && name.elements[i].selectedIndex > -1) {
		    if (name.elements[i].options.length) this.vars[name.elements[i].name] = name.elements[i].options[name.elements[i].selectedIndex].value;
		} else if(name.elements[i].type=="select-multiple") {
		    var t='';
		    for (var k=0; k < name.elements[i].options.length; k++) {
			if (! name.elements[i].options[k].selected) continue;
			if (t.length) t += '\n';
			t += name.elements[i].options[k].value;
		    }
		    if (t.length) this.vars[name.elements[i].name] = t;
		} else if (name.elements[i].type=="hidden" || name.elements[i].type=="password" || name.elements[i].type=="text" || name.elements[i].type=="radio" || name.elements[i].type=="textarea") {
		    this.vars[name.elements[i].name] = name.elements[i].value.trim();
		}
	    }
	}
    }
    var self = this;
    this.run = function() {
	var u = new Array();
	for (key in self.vars) {
		var encoded = Array(encodeURIComponent(key), encodeURIComponent(self.vars[key][0]));
		delete self.vars[key];
		self.vars[encoded[0]] = Array(encoded[1], true);
		key = encoded[0];
		u[u.length] = key + "=" + self.vars[key][0];
	}
	var url = u.join('&');
	var t = self.exe + self.resource;
	if (self.action.toUpperCase()=='GET' && url.length) {
		t += (self.resource.indexOf('?') > -1)? '&' : '?';
		t += url;
	}
	self.xhr.open(self.action.toUpperCase(), t, true);
	if (self.form) self.xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
	self.xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");  
	self.xhr.onreadystatechange = function() {
	    if (self.xhr.readyState != 4) return;
	    var json = (self.xhr.responseText)? JSON.parse(self.xhr.responseText) : null;
	    if (binary.debug) console.log(json);
	    var status = self.xhr.status;
	    if (status == '200') {
		if (self.status) self.status.parentNode.removeChild(self.status);
		self.status=null;
		self.onCompletion(json);
	    } else if (status == '302') {
		self.resource = '';
		self.run();
		return;
	    } else {
		var s;
		if (status == '0') s = setTimeout(self.run,4000); // retry
		alert(self.exe + self.resource + ' - ' + status);
		if (self.status) {
		    with (self.status.getElementsByTagName('div')[0]) {
			className='error';
			title=status + ' - ' + self.xhr.statusText;
			addEventListener('click', function(e) { window.clearTimeout(s); this.parentNode.removeChild(this); alert(this.title) });
		    }
		};
	    }
	};

	self.xhr.send((self.action=='POST')? url : null);

	// create indicator
	if (! self.status && self.statusnextto) {
	    self.status = document.createElement('div');
	    self.status.className = 'ajax';
	    self.statusnextto.appendChild(self.status);
	    var icon = document.createElement('div');
	    self.status.appendChild(icon);
	}
	
	if (self.status) self.status.getElementsByTagName('div')[0].className = 'loading';
    };
};

// create three divs
document.body.appendChild(binary.view.header.obj);
document.body.appendChild(binary.view.content.obj);
document.body.appendChild(binary.view.footer.obj);
