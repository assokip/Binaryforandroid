function AppPlugin(app) {
    app.binarycom.models.support = {
        
        init : function() {
            app.binarycom.navigate.to({ view:document.querySelector('body >.main >.support'), effect:'into' });
        }

    };

    document.querySelector('body >.main >.support >.wrapper >.header >.back').addEventListener('click', function() { app.binarycom.models.home.init({ effect:'back' }); });
    Array.prototype.slice.call(document.querySelectorAll('body >.main >.support >.wrapper >.menu div')).forEach(function(v) {
        if (v.parentNode.className !== 'menu') return;
        //if (v.className==='back') v.addEventListener('click', function() { app.home.init({ effect:'back' }); });
        else v.addEventListener('click', function() { eval('app.binarycom.models.support.'+this.className).init(); });
    });

}