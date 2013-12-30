module.exports = function (app) {
    
    app['binarycom.models.settings'] = {
        init : function() {
            app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.settings'), effect:'into' });
        }
    };

    var sw = document.querySelector('body >.main >.settings >.wrapper');
    var swm = sw.getElementsByClassName('menu')[0];
    
    var ev = app['core.events'];
    
    // view listeners
    ev.listeners.add('core.cache','mode.set', function (o) {
        swm.querySelector('.cache >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
    });
    ev.listeners.add('core.debug','mode.set', function (o) {
        swm.querySelector('.debug >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
    });
    ev.listeners.add('binarycom.safety','mode.set', function (o) {
        swm.querySelector('.safety >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
    });
    ev.listeners.add('binarycom.apigee','login.success', function (o) {
        swm.querySelector('.logout >.wrapper').className = 'wrapper';
     });
    ev.listeners.add('binarycom.apigee','logout.success', function (o) {
        swm.querySelector('.logout >.wrapper').className = 'wrapper disabled';
    });
    
    // debug
    swm.getElementsByClassName('debug')[0].addEventListener('click', function() {
        var tx = app['core.debug'].mode;
        tx.set(tx.get()? false : true);
     });
    // cache
    swm.getElementsByClassName('cache')[0].addEventListener('click', function() {
        var tx = app['core.cache'].mode;
        tx.set(tx.get()? false : true);
    });
    // safety
    swm.getElementsByClassName('safety')[0].addEventListener('click', function(confirm) {
        var tx = app['binarycom.safety'].mode;
        tx.set(tx.get()? false : true);
    });
    // logout
    var logout = swm.getElementsByClassName('logout')[0];
    logout.addEventListener('click', function() {
        if (app['binarycom.apigee'].status.get()) app['binarycom.apigee'].logout();
    });
    var l = logout.getElementsByClassName('wrapper')[0];
    ev.listeners.add('binarycom.apigee','logout.success', function (o) {
        l.className = 'wrapper disabled';
    });
    ev.listeners.add('binarycom.apigee','login.success', function (o) {
        l.className = 'wrapper';
    });
    // initial state?
    if (! app['binarycom.apigee'].status.get()) l.className += ' disabled';
    
    // back
    sw.querySelector('.header >.back').addEventListener('click', function() {
        this.className = 'back disabled';
        app['binarycom.models.home'].init({ effect:'back' });
    });
    
};