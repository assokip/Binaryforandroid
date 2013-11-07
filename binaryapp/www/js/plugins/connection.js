App.prototype.connection = {
    
    source : { 'default' : null },
    types : new Array(),
    pool : new Array(),
    count : function() { return this.pool.length },
    active : {
        pool : new Array(),
        count : function() { return this.pool.length },
        add : function(o) { this.pool.push(o) },
        remove : function(o) { this.pool.splice(this.pool.indexOf(o), 1); }
    },
    create : function(o) {
        if (! o || ! o.exe) o.exe = this.source.default;
        if (! o || ! o.type) o.type = 'xhr';
        var c = new this.types[o.type];
        App.events.dispatch('connection.created',c);
        this.pool.push(c);
        return c;
    },
    remove : function(o) {
        App.events.dispatch('connection.removed',o);
        this.pool.splice(this.pool.indexOf(o), 1);
    },
    abort : function(o) {
        var i = this.pool.indexOf(o);
        if (i===-1) return;
        this.pool[i].abort();
    }
    
};