function AppPlugin(app) {
    
    app.core.currency = {
        validate : function(s,o) {
            if (o && o.allowneg) return RegExp(/^-?\d+(\.\d{2})?$/).test(String(s).trim());
            return RegExp(/^\d+(\.\d{2})?$/).test(String(s).trim());
        },
        decimalise : function(o) {
            o = Math.round(parseFloat(o)*100)/100;
            o = o+'';
            if (o.indexOf('.') == -1) return o+'.00';
            if (o.substr(o.length-2,1) == '.') return o+'0';
            return o;
        }
    };
    
};