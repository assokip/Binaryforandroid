App.prototype.navigate = {
	
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
            App.events.dispatch('view.shown',v.className);
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
            App.events.dispatch('view.hidden',v.className);
        }) }, 1000);
    }
};
    
/* PANELS BELOW */
    
App.prototype.main = {
    init : function(o) {
        var effect = o && o.effect? o.effect : 'into';
        App.navigate.to({ view:document.querySelector('body >.wrapper >.main'), effect:effect });
    }
};
    
App.prototype.trade = {
    init : function(o) {
        var effect = o && o.effect? o.effect : 'into';
        App.navigate.to({ view:document.querySelector('body >.wrapper >.trade'), effect:effect });
        //document.querySelector('body >.wrapper >.trade >.wrapper >.content >.markets').innerHTML='';
        var connection = new igaro_connection({
            resource: '/markets',
            headers : { 'Authorization': 'Bearer '+App.oauth2.params.token },
            onCompletion : function(j) {
                App.events.dispatch('app.data.markets.revised');
            }
        });
        connection.run();
        
    }
};
	
App.prototype.portfolio = {
    init : function() {
        App.navigate.to({ view:document.querySelector('body >.wrapper >.portfolio'), effect:'into' });
    }
};
	
App.prototype.support = {
    init : function() {
        App.navigate.to({ view:document.querySelector('body >.wrapper >.support'), effect:'into' });
    }
};

App.prototype.charts = {
    init : function() {
        App.navigate.to({ view:document.querySelector('body >.wrapper >.charts'), effect:'into' });
    }
};
    
App.prototype.news = {
    init : function() {
        App.navigate.to({ view:document.querySelector('body >.wrapper >.news'), effect:'into' });
    }
};