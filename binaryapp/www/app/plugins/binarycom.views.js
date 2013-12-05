function AppPlugin(app) {
    app.binarycom.views = {
        home : {
            init : function(o) {
                var effect = o && o.effect? o.effect : 'into';
                app.binarycom.navigate.to({ view:document.querySelector('body >.main >.home'), effect:effect });
            }
        },
        
        trade : {
            
            connection : new app.core.connection.create(),
            
            marketselected : null,
            submarketselected : null,
            symbolselected : null,
            contractcategory : null,
            
            spot : {
                timeOut : null,
                history : new Array(),
                connection : new app.core.connection.create(),
                sparkline : new app.binarycom.sparkline.create()
            },
            
                
            init : function(o) {
                var views = document.querySelectorAll('body >.main >.trade >.wrapper >.content');
                views[0].style.display='block';
                views[1].style.display='none';
                
                window.clearTimeout(this.spot.timeOut);
                this.spot.connection.abort();
                views[1].getElementsByClassName('header')[0].getElementsByClassName('spot')[0].innerHTML='';
                
                var self = this;
                app.binarycom.product.get({
                    statusnextto : document.querySelector('body >.main >.home >.wrapper >.menu div'),
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
                                            a.available.forEach(function(a) {
                                                var dc = document.createElement('div');
                                                dc.innerHTML = a.symbol;
                                                symbols.appendChild(dc);
                                                dc.addEventListener('click', function() {
                                                    Array.prototype.slice.call(symbols.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                    self.symbolselected = a.symbol;
                                                    var contracttypes = new Array();
                                                    a.available.forEach(function(b) {
                                                        b.available.forEach(function(c) {
                                                            if (contracttypes.indexOf(c.contract_type) === -1) contracttypes.push(c.contract_type);
                                                        });
                                                    });
                                                    views[1].style.display='block';
                                                    views[0].style.display='none';
                                                    var header = views[1].getElementsByClassName('header')[0];
                                                    var location = header.getElementsByClassName('location')[0];
                                                    location.getElementsByClassName('market')[0].innerHTML = self.marketselected;
                                                    location.getElementsByClassName('submarket')[0].innerHTML = self.submarketselected;
                                                    location.getElementsByClassName('symbol')[0].innerHTML = self.symbolselected;
                                                    var sd = header.getElementsByClassName('sparkline')[0];
                                                    if (! sd.hasChildNodes()) sd.appendChild(self.spot.sparkline.canvas);
                                                    var sp = self.spot.connection;
                                                    sp.headers.set('Authorization', function() {
                                                        var a = app.binarycom.apigee.status.get();
                                                        return a? 'Bearer '+ a.token : '';
                                                    });
                                                    sp.exe = app.binarycom.apigee.url.get();
                                                    sp.resource = '/symbols/'+self.symbolselected.replace(/\//g,'-')+'/price';
                                                    var v = header.getElementsByClassName('spot')[0];
                                                    sp.status.nextto = v;
                                                    sp.onCompletion = function(k) {
                                                        var p = k.price;
                                                        var s = self.spot;
                                                        v.innerHTML = p;
                                                        v.className = 'spot';
                                                        if (s.history.length && s.history[-1] !== p) v.className = 'spot ' + (s.history[-1] < p? 'up' : 'down');
                                                        s.history.push(parseFloat(p));
                                                        s.timeout = setTimeout(sp.run,1500);
                                                        s.sparkline.draw({ data:s.history.slice(s.history.length-10 < 0? 0: s.history.length-10) });
                                                    }
                                                    sp.run();
                                                    var contracttype = views[1].querySelector('.contracttype >.data');
                                                    while(contracttype.firstChild) { contracttype.removeChild(contracttype.firstChild); };
                                                    views[1].getElementsByClassName('contracttype')[0].style.display='block';
                                                    contracttypes.forEach(function(d) {
                                                        var dc = document.createElement('div');
                                                        dc.innerHTML = d.replace(/\b./g, function(m){ return m.toUpperCase(); });
                                                        contracttype.appendChild(dc);
                                                        dc.addEventListener('click', function() {
                                                            Array.prototype.slice.call(contracttype.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                            dc.className='selected';
                                                            self.contracttypeselected = d;
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
                        
                        app.binarycom.navigate.to({ view:document.querySelector('body >.main >.trade'), effect:o && o.effect? o.effect : 'into' });
                    }

                });
            }
        },
         
        portfolio : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.main >.portfolio'), effect:'into' });
            }
        },
                
        support : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.main >.support'), effect:'into' });
            }
        },
        
        charts : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.main >.charts'), effect:'into' });
            }
        },
            
        news : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.main >.news'), effect:'into' });
            }
        },
        
        settings : {
            init : function() {
                app.binarycom.navigate.to({ view:document.querySelector('body >.main >.settings'), effect:'into' });
            }
        }
    }
    
}