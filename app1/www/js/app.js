var app = {

    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    }

};

binaryapp = {
    
    debug:1,
    
    events : {
        listener : {
            list :  new Array(),
            add : function(event, fn) {
                if (! this.list[event]) this.list[event] = [];
                if (!(fn in this.list) && fn instanceof Function) this.list[event].push(fn);
                if (binaryapp.debug) console.log('EVENTS:ADD:'+event);
            },
            remove : function(event, fn) {
                if (! this.list[event]) return;
                for (var i=0, l=this.list[event].length; i<l; i++) {
                    if (this.list[event][i] === fn) {
                        if (binaryapp.debug) console.log('EVENTS:REMOVE:'+event);
                        this.list[event].slice(i,1);
                        break;
                    }
                }
            }
        },
        dispatch : function(event, params) {
            if (! this.listener.list[event]) return;
            for (var i=0, l=this.listener.list[event].length; i<l; i++) {
                if (binaryapp.debug) console.log('EVENTS:DISPATCH:'+event);
                this.listener.list[event][i].call(window, params);
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
                binaryapp.events.dispatch('view.shown',v.className);
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
                binaryapp.events.dispatch('view.hidden',v.className);
            }) }, 1000);
            
        }
    },
    
    init : function() {
        this.navigate.to({ view:document.querySelector('body >.wrapper >.connecting') });
        var self=this;
        var win = window.open(encodeURI('https://andrewdev.binary.com/apilogin?scope=chart&client_id=3yqBdSJfFGIZELagj9VIt5cAr8tMknRA'), '_blank', 'location=no'); 
  
        win.addEventListener('loadstop', function(event) { win.close(); alert(event.url); });

    },
    
    main : {
        init : function(o) {
            var effect = o && o.effect? o.effect : 'into';
            binaryapp.navigate.to({ view:document.querySelector('body >.wrapper >.main'), effect:effect });
        }
    },
    
    trade : {
        init : function() {
            
            
            
        }
    },
    
    support : {
        init : function() {
            binaryapp.navigate.to({ view:document.querySelector('body >.wrapper >.support'), effect:'into' });
        }
    
    }
    
};

Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.main >.wrapper >.menu div')).forEach(function(v) {
    if (v.parentNode.className !== 'menu') return;
    if (v.className==='exit') v.addEventListener('click', function() { binaryapp.events.dispatch('exit'); });
    else v.addEventListener('click', function() { eval('binaryapp.'+this.className).init(); });
});

Array.prototype.slice.call(document.querySelectorAll('body >.wrapper >.support >.wrapper >.menu div')).forEach(function(v) {
    if (v.parentNode.className !== 'menu') return;
    if (v.className==='back') v.addEventListener('click', function() { binaryapp.main.init({ effect:'back' }); });
    else v.addEventListener('click', function() { eval('binaryapp.support.'+this.className).init(); });
});

binaryapp.events.listener.add('exit', function() { app.exitApp() });

document.addEventListener('deviceready', binaryapp.init, false);

binaryapp.init();
