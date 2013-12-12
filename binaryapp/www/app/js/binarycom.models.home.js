function AppPlugin(app) {
    app['binarycom.models.home'] = {
        
        init : function(o) {
            var effect = o && o.effect? o.effect : 'into';
            app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.home'), effect:effect });
            //app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.home') });
        }
        
    };
    
    var mvm = document.querySelector('body >.main >.home >.wrapper >.menu');
        //settings
        var mvms = document.querySelector('body >.main >.settings >.wrapper >.menu');
        mvm.getElementsByClassName('settings')[0].addEventListener('click', function() {
            app['binarycom.models.settings'].init();
        });
        app['core.events'].listeners.add('core.cache.mode.set', function (o) {
            mvms.querySelector('.cache >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
        });
        app['core.events'].listeners.add('core.debug.mode.set', function (o) {
            mvms.querySelector('.debug >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
        });
        app['core.events'].listeners.add('binarycom.safety.mode.set', function (o) {
            mvms.querySelector('.safety >.wrapper').className = 'wrapper ' + (o? ' on' : ' off');
        });
        app['core.events'].listeners.add('binarycom.apigee.login.success', function (o) {
            mvms.querySelector('.logout >.wrapper').className = 'wrapper';
         });
        app['core.events'].listeners.add('binarycom.apigee.logout.success', function (o) {
            mvms.querySelector('.logout >.wrapper').className = 'wrapper disabled';
        });
         
     mvm.getElementsByClassName('charts')[0].addEventListener('click', function() {
         app['binarycom.models.charts'].init();
     });
     mvm.getElementsByClassName('trade')[0].addEventListener('click', function() {
         app['binarycom.models.trade'].ui.stage1.init();
     });
     mvm.getElementsByClassName('support')[0].addEventListener('click', function() {
         app['binarycom.models.support'].init();
     });
     mvm.getElementsByClassName('news')[0].addEventListener('click', function() {
         app['binarycom.models.news'].init();
     });
     mvm.getElementsByClassName('portfolio')[0].addEventListener('click', function() {
         app['binarycom.models.portfolio'].init();
     });

}