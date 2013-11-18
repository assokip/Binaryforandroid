function AppPlugin(app) {
    app.binarycom.navigate = {
        current : null,

        to : function(o) {
            var view = o.view;
            var ic = Array.prototype.slice.call(view.parentNode.getElementsByTagName('div'));
            var self=this._self;
            
            ic.forEach(function(v) {
                var c = v.className.split(' ');
                if (v.parentNode !== view.parentNode || view.className !== c[0]) return;
                for(var i=0; i<c.length;i++) {
                    if (c[i].substr(0,7) !== 'effect_') continue;
                    c.splice(i,1);
                    break;
                }
                v.className = c.join(' ');
                if (o.effect) v.className += ' effect_'+o.effect;
                if (this.current) this.current.style.zIndex=0;
                v.style.zIndex = 1;
                v.style.visibility='visible';
                app.core.events.dispatch('core.view.shown',v);
                this.current = v;
            });
            
            setTimeout( function() {
                ic.forEach(function(v) {
                    if (this.current.parentNode !== v.parentNode || v === this.current || v.style.visibility==='hidden') return;
                    var c = v.className.split(' ');
                    for(var i=0; i<c.length;i++) {
                        if (c[i].substr(0,7) !== 'effect_') continue;
                        c.splice(i,1);
                        break;
                    }
                    v.className = c.join(' ');
                    v.style.visibility='hidden';
                    v.style.zIndex=0;
                    app.core.events.dispatch('core.view.hidden',v);
                })
            }, 300);
        }

    };

}