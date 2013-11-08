function AppPlugin(app) {
    app.cordova = {
        loaded : window.cordova || window.PhoneGap? true : false
    };
};        

//App.prototype.exit = function() {
//    navigator.App.exitApp();
//};


