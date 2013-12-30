module.exports = function(app) {

    app.core.date = {
        atload : new Date(),
        locale : {
            id : null,
            set : function(id) {
                this.id=id;
                app['core.events'].dispatch('core.date','locale.set', this.id);
            },
            get : function() { return this.id; }
        },
    
        isLeapYear : function(y) {
            return (new Date(y,1,29).getDate() == 29)? true:false;
        },
    
        daysInMonth : function (cYear,cMonth) {
            if (cMonth == 4 || cMonth == 6 || cMonth == 9 || cMonth == 11) return 30;
            if (cMonth == 2) return (this.isleapyear(cYear))? 29:28;
            return 31;
        }
    };

};