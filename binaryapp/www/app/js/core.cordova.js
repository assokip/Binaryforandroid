module.exports = function(app) {

    if (window.cordova || window.PhoneGap) app['core.cordova'] = new Object();

};