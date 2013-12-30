module.exports = function(app) {

    app['core.form.message'] = {
        pool : new Object(),
        show : function(o) {
            var form = o.form;
            this.clear(form);
            
            var t = this.pool[form]? this.pool[form].msgobj : document.createElement('div');
            var setSize = function() {
                var obj = o.near;
                var curleft = 0;
                var curtop = (obj.type && obj.type==='select-one')? obj.offsetHeight : obj.clientHeight;
                if(obj.offsetParent) {
                    while(1) {
                        curleft += obj.offsetLeft;
                        curtop += obj.offsetTop;
                        if(! obj.offsetParent) break;
                        obj = obj.offsetParent;
                    }
                } else if (obj.x) {
                    curleft += obj.x; curtop += obj.y;
                }
                t.style.left = curleft + 'px';
                t.style.top = curtop + 'px';
            }
            t.innerHTML = o.msg;
            setSize();

            if (this.pool[form]) return;
            t.className='core-form-message';
            document.body.appendChild(t);
            this.pool[form] = {
                msgobj:t,
                resizeEvent : window.addEventListener('resize', setSize),
                onSubmit : form.addEventListener('submit', function() { self.clear(this) }),
                frmObjEvents : new Array()
            };
            var self = this;
            Array.prototype.slice(form.elements).forEach(function (k) {
                var t = 'oninput' in k? 'input' : 'change';
                this.pool[form].frmObjEvents.push({ obj:k, type:t, event:k.addEventListener(t, function() { self.clear(form) }) });
            });

        },
        
        clear : function(form) {
            if (! this.pool[form]) return;
            var frm = this.pool[form];
            window.removeEventListener('resize',frm.resizeEvent);
            form.removeEventListener('submit',frm.onSubmit);
            frm.frmObjEvents.forEach(function (o) {
                o.obj.removeEventListener(o.type,o.event);
            });
            var msg = frm.msgobj;
            msg.parentNode.removeChild(msg)
            delete this.pool[form];
        }
    };

};