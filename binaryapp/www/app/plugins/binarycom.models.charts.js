function AppPlugin(app) {
    app.binarycom.models.charts = {
        
        init : function() {
            app.binarycom.navigate.to({ view:document.querySelector('body >.main >.charts'), effect:'into' });
        }    
        
    };

    document.querySelector('body >.main >.charts >.wrapper >.header >.back').addEventListener('click', function() { app.binarycom.models.home.init({ effect:'back' }); });

}