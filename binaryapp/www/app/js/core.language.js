module.exports = function(app) {

    app['core.language'] = {
        locale : {
            id : null,
            set : function(id) {
                this.id=id;
                app['core.events'].dispatch('core.language','locale.set', this.id);
            },
            get : function() { return this.id; }
        }
    };

};
