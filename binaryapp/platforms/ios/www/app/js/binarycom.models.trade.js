function AppPlugin(app) {
    
    app.binarycom.models.trade = {
        
        offerings : {
            connection : app.core.connection.create({
                exe : app.binarycom.apigee.url.get(),
                resource : '/offerings',
                headers : {
                    'Authorization' : function() {
                        var a = app.binarycom.apigee.status.get();
                        return a? 'Bearer '+ a.token : '';
                    }
                }
            }),
            refreshminutes : 15,
            get : function(o) {
                if (!o) o = {};
                var cache = app.core.cache.get('binarycom.product');
                if (! cache) {
                    var self = this;
                    var c = this.connection;
                    c.status.nextto = o.statusnextto? o.statusnextto : null;
                    c.onCompletion = function(k) {
                        var dt = new Date();
                        dt.setMinutes(dt.getMinutes()+self.refreshminutes);
                        app.core.cache.set({ id:'binarycom.product', value:k, expiry:dt });
                        if (o.onCompletion) o.onCompletion(k);
                    }
                    c.run();
                } else {
                    if (o.onCompletion) o.onCompletion(cache);
                }
            }
        },
            

        ui : {
                
            stage1 : {
                
                init : function() {
                    
                    var mv = document.querySelector('body >.main');
                    var view_options = mv.querySelector('.trade_options >.wrapper >.content');
                    var view_purchase = mv.querySelector('.trade_purchase >.wrapper >.content');

                    var self = this;
                    app.binarycom.models.trade.offerings.get({
                        statusnextto : mv.querySelector('.home >.wrapper >.menu div'),
                        onCompletion : function(data) {
                            var m = Object.keys(data.selectors.market).sort();
                            var markets = view_options.querySelector('.markets >.data');
                            while(markets.firstChild) { markets.removeChild(markets.firstChild); };
                            m.forEach(function (market) {
                                var dc = document.createElement('div');
                                if (self.selected.market === market) dc.className='selected';
                                dc.innerHTML = market;
                                dc.addEventListener('click', function() {
                                    Array.prototype.slice.call(markets.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                    dc.className='selected';
                                    self.selected.market = market;
                                    var submarkets = view_options.querySelector('.submarkets >.data');
                                    while(submarkets.firstChild) { submarkets.removeChild(submarkets.firstChild); };
                                    view_options.getElementsByClassName('submarkets')[0].style.display='block';
                                    view_options.getElementsByClassName('symbols')[0].style.display='none';
                                    data.offerings.some(function (offering) {
                                        if (offering.market !== market) return;
                                        offering.available.forEach(function(a) {
                                            var dc = document.createElement('div');
                                            dc.innerHTML = a.submarket;
                                            submarkets.appendChild(dc);
                                            
                                            // is the submarket open?
                                            var open = new Date();
                                            var closed = new Date();
                                            if (!(open.getTime() <= new Date().getTime() <= closed.getTime())) dc.className='disabled';
                                            
                                            dc.addEventListener('click', function() {
                                                Array.prototype.slice.call(submarkets.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                dc.className='selected';
                                                self.selected.submarket = a.submarket;
                                                var symbols = view_options.querySelector('.symbols >.data');
                                                while(symbols.firstChild) { symbols.removeChild(symbols.firstChild); };
                                                view_options.getElementsByClassName('symbols')[0].style.display='block';
                                                a.available.forEach(function(a) {
                                                    var dc = document.createElement('div');
                                                    dc.innerHTML = a.symbol;
                                                    symbols.appendChild(dc);
                                                    dc.addEventListener('click', function() {
                                                        Array.prototype.slice.call(symbols.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                        self.selected.symbol = a.symbol;
                                                        var contracttypes = new Array();
                                                        a.available.forEach(function(b) {
                                                            b.available.forEach(function(c) {
                                                                if (contracttypes.indexOf(c.contract_type) === -1) contracttypes.push(c.contract_type);
                                                            });
                                                        });
                                                        app.binarycom.navigate.to({ view:mv.querySelector('.trade_purchase'), effect:false });
                                                        var header = view_purchase.getElementsByClassName('header')[0];
                                                        var location = header.getElementsByClassName('location')[0];
                                                        location.getElementsByClassName('market')[0].innerHTML = self.selected.market;
                                                        location.getElementsByClassName('submarket')[0].innerHTML = self.selected.submarket;
                                                        location.getElementsByClassName('symbol')[0].innerHTML = self.selected.symbol;
                                                        var sd = header.getElementsByClassName('sparkline')[0];
                                                        var spot = app.binarycom.models.trade.symbol.spot;
                                                        if (! sd.hasChildNodes()) sd.appendChild(spot.sparkline.canvas);
                                                        var sp = spot.connection;
                                                        sp.resource = '/symbols/'+self.selected.symbol.replace(/\//g,'-')+'/price';
                                                        var v = header.getElementsByClassName('spot')[0];
                                                        sp.status.nextto = v;
                                                        sp.onCompletion = function(k) {
                                                            var p = parseFloat(k.price);
                                                            v.innerHTML = p;
                                                            v.className = 'spot';
                                                            if (spot.history.length > 0 && spot.history[spot.history.length-1] !== p) v.className += spot.history[spot.history.length-1] < p? ' up' : ' down';
                                                            spot.history.push(p);
                                                            spot.refresher = setTimeout(sp.run,1500);
                                                            spot.sparkline.draw({ data:spot.history.slice(spot.history.length-10 < 0? 0: spot.history.length-10) });
                                                        }
                                                        sp.run();
                                                        var contracttype = view_purchase.querySelector('.contracttype >.data');
                                                        while(contracttype.firstChild) { contracttype.removeChild(contracttype.firstChild); };
                                                        view_purchase.getElementsByClassName('contracttype')[0].style.display='block';
                                                        contracttypes.forEach(function(d) {
                                                            var dc = document.createElement('div');
                                                            dc.innerHTML = d.replace(/\b./g, function(m){ return m.toUpperCase(); });
                                                            contracttype.appendChild(dc);
                                                            dc.addEventListener('click', function() {
                                                                Array.prototype.slice.call(contracttype.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                                dc.className='selected';
                                                                self.selected.contracttype = d;
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
                            
                            self.show();
                        }
                        
                    });
                    
                },
                
                show : function(o) {
                    app.binarycom.navigate.to({ view:document.querySelector('body >.main >.trade_options'), effect:o && 'effect' in o? o.effect : 'into' });
                },
                
                selected : {
                    market:null,
                    symbol:null,
                    submarket:null,
                    contracttype:null
                }
 
            }

        },
        
        symbol : {
            
            spot : {
                refresher : null,
                history : new Array(),
                connection : app.core.connection.create({
                    exe : app.binarycom.apigee.url.get(),
                    headers : {
                        'Authorization' : function() {
                            var a = app.binarycom.apigee.status.get();
                            return a? 'Bearer '+ a.token : '';
                        }
                    }
                }),
                sparkline : app.binarycom.sparkline.create()
            },
        }
        
    };
    
    // back buttons
    document.querySelector('body >.main >.trade_options >.wrapper >.header >.back').addEventListener('click', function() {
	app.binarycom.models.home.init({ effect:'back' });
    });
    document.querySelector('body >.main >.trade_purchase >.wrapper >.header >.back').addEventListener('click', function() {
	app.binarycom.models.trade.ui.stage1.show({ effect:false });
    });

    // abort connections
    app.core.events.listeners.add('binarycom.navigate.to', function (o) {
        if (o.id === 'trade_purchase') return;
        var trade = app.binarycom.models.trade;
        var spot = trade.symbol.spot;
        window.clearTimeout(spot.refresher);
        spot.connection.abort();
        trade.offerings.connection.abort();
        document.querySelector('body >.main >.trade_purchase >.wrapper >.content').getElementsByClassName('header')[0].getElementsByClassName('spot')[0].innerHTML='';
    });
    

}