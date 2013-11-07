App.prototype.status = {
    
    events : new Array(),
    remove : function(l) {
        if (l) {
            var i = this.events.indexOf(l);
            if (i === -1) return;
            this.events.splice(i,1);
        } else {
            this.events.length=0;
        }
    },
    append : function(i) {
        this.events.push(i);
    }
    
};