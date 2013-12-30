function AppPlugin(app) {
    
    app['core.form.message'] = {

        pool : {},

		reposition : function(o) {
			var p = this.pool[o];
            if (! p) return;
			var obj = p.near;
			var msg = p.msgobj;
			var curleft = 0;
			var curtop = (obj.type=='select-one')? obj.offsetHeight : obj.clientHeight;
			if(obj.offsetParent) {
			    while(o !== obj) {
			      curleft += obj.offsetLeft;
			      curtop += obj.offsetTop;
			      if(!obj.offsetParent) break;
			      obj = obj.offsetParent;
			    }
			} else if(obj.x) {
			    curleft += obj.x; curtop += obj.y;
			}
			msg.style.left=curleft + 'px';
			msg.style.top=curtop + 'px';
		},

        show : function(o) {
			var self = this;
            this.clear(o.form);
            if (! this.pool[o.form]) {
				var t = document.createElement('div');
				t.className='core-form-message';
				o.form.appendChild(t);
				this.pool[o.form] = {
					msgobj:t,
					near:o.near,
					onsubmit : o.form.addEventListener('submit', function() { self.clear(o.form) }),
					onresize : window.addEventListener('resize', function() { self.reposition(o.form); })
				};
			}
			this.pool[o.form].msgobj.innerHTML = o.msg;
			this.reposition(o.form);
        },
        
        clear : function(form) {
			var self = this;
			if (! form) {
				Object.keys(this.pool).forEach(function(p) { self.clear(p); });
				return;
			}
			var p = this.pool[form];
            if (! p) return;
            var msg = p.msgobj;
			if (p.onresize) window.removeEventListener('resize',p.onresize);
			if (p.onsubmit) form.removeEventListener('submit',p.onsubmit);
            msg.parentNode.removeChild(msg)
            this.pool[form] = null;
        }
    
    }
    
};

AppPluginLoaded=true;