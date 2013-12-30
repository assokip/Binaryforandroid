module.exports = function(app) {

    app['core.debug'] = {

        log : {
            data : new Array(),
            get : function() { return this.data },
            append : function(name,event,value) {
                var p = { name:name, event:event, value:value };
                app['core.events'].dispatch('core.debug','log.append', p);
                this.data.push(p);
            }
        },

        mode : {
            value : false,
            set : function(o) {
                this.value = o;
                app['core.events'].dispatch('core.debug','mode.set',o);
            },
            get : function() {
                return this.value;
            }
        }
    };

};
