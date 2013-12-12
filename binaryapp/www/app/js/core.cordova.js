function AppPlugin(app) {
    app['core.cordova'] = {
        loaded : window.cordova || window.PhoneGap? true : false
    };
};        

//App.prototype.exit = function() {
//    navigator.App.exitApp();
//};


AppPluginLoaded=true;