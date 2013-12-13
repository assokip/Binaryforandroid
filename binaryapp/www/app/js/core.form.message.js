function AppPlugin(app) {
    
    app['core.form.message'] = {

        pool : new Object(),
        show : function(o) {
            this.clear(o.form);
            var obj = o.near;
            var t = document.createElement('div');
            t.className='apmessage';
            t.style.left=obj.offsetLeft + 'px';
            t.style.top= ((obj.type==='select-one'? obj.offsetHeight : obj.clientHeight)+obj.offsetTop) + 'px';
            t.innerHTML = o.msg;
            o.near.parentNode.appendChild(t);
            o.near.parentNode.style.position='relative';
            
            if (! this.pool[o.form]) this.pool[o.form] = { onsubmit:null, msgobj:null };
            var self = this;
            if (! this.pool[o.form].onsubmit) {
                this.pool[o.form].onsubmit = o.form.addEventListener('submit', function() { self.clear(this) });
                var e = o.form.elements;
                for (var i=0; i < e.length; i++) {
                    e[i].addEventListener('oninput' in e[i]? 'input' : 'change',function() { self.clear(o.form) });
                };
            }
            this.pool[o.form].msgobj = t;
        },
        
        clear : function(form) {
            if (! this.pool[form] || ! this.pool[form].msgobj) return;
            var msg = this.pool[form].msgobj;
            msg.parentNode.removeChild(msg)
            this.pool[form].msgobj = null;
        }
    
    }
    
};

AppPluginLoaded=true;