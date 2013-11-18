function AppPlugin(app) {
    app.binarycom.views = {
        home : {
            init : function(o) {
                var effect = o && o.effect? o.effect : 'into';
                app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.home'), effect:effect });
            }
        },
        
        trade : {
            
            connection : new app.core.connection.create(),
            
            marketselected : null,
            submarketselected : null,
            symbolselected : null,
            contractcategory : null,
                
            init : function(o) {
                var views = document.querySelectorAll('body >.wrapper >.trade >.wrapper >.content');
                views[0].style.display='block';
                views[1].style.display='none';
                var self = this;
                app.binarycom.product.get({
                    statusnextto : document.querySelector('body >.wrapper >.home >.wrapper >.menu div'),
                    onCompletion : function(data) {
                        var m = Object.keys(data.selectors.market).sort();
                        var markets = views[0].querySelector('.markets >.data');
                        while(markets.firstChild) { markets.removeChild(markets.firstChild); };
                        m.forEach(function (market) {
                            var dc = document.createElement('div');
                            if (self.marketselected === market) dc.className='selected';
                            dc.innerHTML = market;
                            dc.addEventListener('click', function() {
                                Array.prototype.slice.call(markets.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                dc.className='selected';
                                self.marketselected = market;
                                var submarkets = views[0].querySelector('.submarkets >.data');
                                while(submarkets.firstChild) { submarkets.removeChild(submarkets.firstChild); };
                                views[0].getElementsByClassName('submarkets')[0].style.display='block';
                                views[0].getElementsByClassName('symbols')[0].style.display='none';
                                views[0].getElementsByClassName('contractcategory')[0].style.display='none';
                                data.offerings.some(function (offering) {
                                    if (offering.market !== market) return;
                                    offering.available.forEach(function(a) {
                                        var dc = document.createElement('div');
                                        dc.innerHTML = a.submarket;
                                        submarkets.appendChild(dc);
                                        dc.addEventListener('click', function() {
                                            Array.prototype.slice.call(submarkets.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                            dc.className='selected';
                                            self.submarketselected = a.submarket;
                                            var symbols = views[0].querySelector('.symbols >.data');
                                            while(symbols.firstChild) { symbols.removeChild(symbols.firstChild); };
                                            views[0].getElementsByClassName('symbols')[0].style.display='block';
                                            views[0].getElementsByClassName('contractcategory')[0].style.display='none';
                                            a.available.forEach(function(a) {
                                                var dc = document.createElement('div');
                                                dc.innerHTML = a.symbol;
                                                symbols.appendChild(dc);
                                                dc.addEventListener('click', function() {
                                                    Array.prototype.slice.call(symbols.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                    dc.className='selected';
                                                    self.symbolselected = a.symbol;
                                                    var contractcategory = views[0].querySelector('.contractcategory >.data');
                                                    while(contractcategory.firstChild) { contractcategory.removeChild(contractcategory.firstChild); };
                                                    views[0].getElementsByClassName('contractcategory')[0].style.display='block';
                                                    a.available.forEach(function(a) {
                                                        var dc = document.createElement('div');
                                                        dc.innerHTML = a.contract_category;
                                                        contractcategory.appendChild(dc);
                                                        dc.addEventListener('click', function() {
                                                            self.contractcategoryselected = a.contract_category;
                                                            views[1].style.display='block';
                                                            views[0].style.display='none';
                                                            var title = views[1].getElementsByClassName('title')[0];
                                                            while(title.firstChild) { title.removeChild(title.firstChild); };
                                                            var s = document.createElement('div');
                                                            s.innerHTML = self.marketselected;
                                                            title.appendChild(s);
                                                            s = document.createElement('div');
                                                            s.innerHTML = self.submarketselected;
                                                            title.appendChild(s);
                                                            s = document.createElement('div');
                                                            s.innerHTML = self.symbolselected;
                                                            title.appendChild(s);
                                                            s = document.createElement('div');
                                                            s.innerHTML = self.contractcategoryselected;
                                                            title.appendChild(s);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                    return true;
                                });
                            });
                            markets.appendChild(dc);
                        });
                        
                        app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.trade'), effect:o && o.effect? o.effect : 'into' });
                    }

                });
            }
        },
         
        portfolio : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.portfolio'), effect:'into' });
            }
        },
                
        support : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.support'), effect:'into' });
            }
        },
        
        charts : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.charts'), effect:'into' });
            }
        },
            
        news : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.news'), effect:'into' });
            }
        },
        
        settings : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.wrapper >.settings'), effect:'into' });
            }
        }
    }
    
}