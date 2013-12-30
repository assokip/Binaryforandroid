module.exports = function (app) {

    app['binarycom.models.portfolio'] = {
        
        init : function() {
            app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.portfolio'), effect:'into' });
        }    
        
    };

    document.querySelector('body >.main >.portfolio >.wrapper >.header >.back').addEventListener('click', function() { app['binarycom.models.home'].init({ effect:'back' }); });
    
};