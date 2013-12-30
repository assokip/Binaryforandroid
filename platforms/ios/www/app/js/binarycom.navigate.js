function AppPlugin(app) {
    app['binarycom.navigate'] = {
        current : null,
     
        to : function(o) {
            var view = o.view;
            var ic = Array.prototype.slice.call(view.parentNode.getElementsByTagName('div'));
            var self=this;
            
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
                v.style.zIndex = 1;
                if (self.current) self.current.style.zIndex=0;
                v.style.visibility='visible';
                app['core.events'].dispatch('binarycom.navigate.to',{ view:v, id:self.current });
                self.current = v;
            });
            
            var f = function() {
                ic.forEach(function(v) {
                    if (self.current.parentNode !== v.parentNode || v === self.current || v.style.visibility==='hidden') return;
                    var c = v.className.split(' ');
                    for(var i=0; i<c.length;i++) {
                        if (c[i].substr(0,7) !== 'effect_') continue;
                        c.splice(i,1);
                        break;
                    }
                    v.className = c.join(' ');
                    v.style.visibility='hidden';
                    v.style.zIndex=0;
                })
            }
            
            if (o.effect) setTimeout(f, 300);
            else { f(); }
        },
        
    };

}

// abort connections
app['core.events'].listeners.add('binarycom.navigate.to', function (o) {
	app['core.form.message'].clear();
});

AppPluginLoaded=true;