function AppPlugin(app) {
    
    app.core.form.message = {

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
    
    }
    
};