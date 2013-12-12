function AppPlugin(app) {
    app['binarycom.models.news'] = {
        
        init : function() {
            app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.news'), effect:'into' });
        }
        
    };

    document.querySelector('body >.main >.news >.wrapper >.header >.back').addEventListener('click', function() { app['binarycom.models.home'].init({ effect:'back' }); });
    
}