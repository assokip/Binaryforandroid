function AppPlugin(app) {
    
    var mv = document.querySelector('body >.main');
    var view_options = mv.querySelector('.trade_options >.wrapper >.content');
        var markets = view_options.getElementsByClassName('markets')[0];
            var markets_c = markets.getElementsByTagName('div')[1];
        var submarkets = view_options.getElementsByClassName('submarkets')[0];
            var submarkets_c = submarkets.getElementsByTagName('div')[1];
        var symbols = view_options.getElementsByClassName('symbols')[0];
            var symbols_c = symbols.getElementsByTagName('div')[1];
    
    var view_purchase = mv.querySelector('.trade_purchase >.wrapper >.content');
        var timings = view_purchase.getElementsByClassName('timings')[0];
            var timings_c = timings.getElementsByTagName('div')[1];
        var barrier = view_purchase.getElementsByClassName('barrier')[0];
        var barriers = view_purchase.getElementsByClassName('barriers')[0];
        var barrieroffset = view_purchase.getElementsByClassName('barrieroffset')[0];

    var tform = view_purchase.getElementsByTagName('form')[0];
    

    app['binarycom.models.trade'] = new function() {
        
        var root = this;
        var api = app['binarycom.apigee'];
        
        this.init = function() {
                
            var self = this;
            app['binarycom.api.offerings'].get({
                statusnextto : mv.querySelector('.home >.wrapper >.menu div'),
                onCompletion : function(data) {
                    var m = Object.keys(data.selectors.market).sort();
                    while(markets_c.firstChild) { markets_c.removeChild(markets_c.firstChild); };
                    m.forEach(function (market) {
                        var dc = document.createElement('div');
                        if (self.selected.market === market) dc.className='selected';
                        dc.innerHTML = market;
                        markets_c.appendChild(dc);
                        dc.addEventListener('click', function() {
                            Array.prototype.slice.call(markets_c.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                            dc.className='selected';
                            self.selected.market = market;
                            submarkets.style.display='block';
                            while(submarkets_c.firstChild) { submarkets_c.removeChild(submarkets_c.firstChild); };
                            symbols.style.display='none';
                            data.offerings.some(function (offering) {
                                if (offering.market !== market) return;
                                offering.available.forEach(function(a) {
                                    var dc = document.createElement('div');
                                    dc.innerHTML = a.submarket;
                                    submarkets_c.appendChild(dc);
                                    
                                    // is the submarket open?
                                    var open = new Date();
                                    var closed = new Date();
                                    if (!(open.getTime() <= new Date().getTime() <= closed.getTime())) dc.className='disabled';
                                    
                                    dc.addEventListener('click', function() {
                                        Array.prototype.slice.call(submarkets_c.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                        dc.className='selected';
                                        self.selected.submarket = a.submarket;
                                        symbols.style.display='block';
                                        while(symbols_c.firstChild) { symbols_c.removeChild(symbols_c.firstChild); };
                                        a.available.forEach(function(a) {
                                            var dc = document.createElement('div');
                                            dc.innerHTML = a.symbol;
                                            symbols_c.appendChild(dc);
                                            dc.addEventListener('click', function() {
                                                Array.prototype.slice.call(symbols_c.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                self.selected.symbol = a.symbol;
                                                var contracttypes = new Array();
                                                a.available.forEach(function(b) {
                                                    b.available.forEach(function(c) {
                                                        if (contracttypes.indexOf(c.contract_type) === -1) contracttypes.push(c.contract_type);
                                                    });
                                                });
                                                app['binarycom.navigate'].to({ view:mv.querySelector('.trade_purchase'), effect:false });
                                                var header = view_purchase.getElementsByClassName('header')[0];
                                                var location = header.getElementsByClassName('location')[0];
                                                location.getElementsByClassName('market')[0].innerHTML = self.selected.market;
                                                location.getElementsByClassName('submarket')[0].innerHTML = self.selected.submarket;
                                                location.getElementsByClassName('symbol')[0].innerHTML = self.selected.symbol;
                                                timings.style.display=barrier.style.display=barriers.style.display=barrieroffset.style.display='none';
                                                ['barrier','barrieroffset','barrierhigh','barrierlow'].forEach(function (o) {
                                                    var e = tform.elements[o];
                                                    e.setAttribute('placeholder','');
                                                    e.value='';
                                                });
                                                var sd = header.getElementsByClassName('sparkline')[0];
                                                var spot = root.symbol.spot;
                                                if (! sd.hasChildNodes()) sd.appendChild(spot.sparkline.canvas);
                                                var sp = spot.connection;
                                                sp.resource = '/symbols/'+self.selected.symbol.replace(/\//g,'-')+'/price';
                                                var v = header.getElementsByClassName('spot')[0];
                                                sp.status.nextto = v;
                                                sp.onCompletion = function(k) {
                                                    var p = parseFloat(k.price);
                                                    v.innerHTML = p;
                                                    tform.elements['barrier'].setAttribute('placeholder',p);
                                                    tform.elements['barrieroffset'].setAttribute('placeholder',p);
                                                    var r = p*0.02;
                                                    var h = (p+r).toString().substr(0,p.toString().length);
                                                    var l = (p-r).toString().substr(0,p.toString().length);
                                                    tform.elements['barrierhigh'].setAttribute('placeholder',h);
                                                    tform.elements['barrierlow'].setAttribute('placeholder',l);
                                                    v.className = 'spot';
                                                    if (spot.history.length > 0 && spot.history[spot.history.length-1] !== p) v.className += spot.history[spot.history.length-1] < p? ' up' : ' down';
                                                    spot.history.push(p);
                                                    spot.refresher = setTimeout(sp.run,1500);
                                                    spot.sparkline.draw({ data:spot.history.slice(spot.history.length-10 < 0? 0: spot.history.length-10) });
                                                }
                                                sp.run();
                                                var contracttype = view_purchase.querySelector('.contracttype').getElementsByTagName('div')[1];
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
                                                        
                                                        // let the fun begin
                                                        
                                                        var intraday = false;
                                                        var forwardstart = false;
                                                        a.available.forEach(function (c) {
                                                            if (c.contract_type !== d) return;
                                                            if (c.is_forward_starting === 'Y') forwardstart = true;
                                                            if (c.expiry_type === 'intraday') intraday = true;
                                                        });
                                                        
                                                        // this is crap: the api doesn't specify barrier info
                                                        tform.elements['barrier'].value=tform.elements['barrieroffset'].value=tform.elements['barrierhigh'].value=tform.elements['barrierlow'].value=''
                                                        barrier.style.display=['rises','falls'].indexOf(d) != -1? '' : 'none';
                                                        barriers.style.display=d.search('between') != -1 || d.search('outside') != -1? '' : 'none';
                                                        barrieroffset.style.display=d.search('touch') != -1? '' : 'none';
                                                        
                                                        timings.style.display='block';
                                                        timings_c.getElementsByClassName('starttime')[0].style.display=forwardstart? '' : 'none';
                                                       // timings.getElementsByClassName('intraday')[0].style.display=intraday? '' : 'none';

                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                                return true;
                            });

                        });
                    });
                    
                    self.show();
                }
                
            });
            
        };

        this.show = function(o) {
            app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.trade_options'), effect:o && 'effect' in o? o.effect : 'into' });
        },
        
        this.selected = {
            market:null,
            symbol:null,
            submarket:null,
            contracttype:null,
            currency:null
        }
 
        this.symbol = {
            
            spot : {
                refresher : null,
                history : new Array(),
                connection : app['core.connection'].create({
                    exe : api.url.get(),
                    headers : {
                        'Authorization' : function() {
                            var a = api.status.get();
                            return a? 'Bearer '+ a.token : '';
                        }
                    }
                }),
                sparkline : app['binarycom.sparkline'].create()
            },
        }
        
    };
    
    // back buttons
    mv.querySelector('.trade_options >.wrapper >.header >.back').addEventListener('click', function() {
	app['binarycom.models.home'].init({ effect:'back' });
    });
    mv.querySelector('.trade_purchase >.wrapper >.header >.back').addEventListener('click', function() {
	app['binarycom.models.trade'].show({ effect:false });
    });

    // abort connections
    app['core.events'].listeners.add('binarycom.navigate.to', function (o) {
        if (o.id === 'trade_purchase') return;
        var trade = app['binarycom.models.trade'];
        var spot = trade.symbol.spot;
        window.clearTimeout(spot.refresher);
        spot.connection.abort();
        app['binarycom.api.offerings'].abort();
    });
    
    // output price
    var payout = tform.elements['payout'];
    payout.addEventListener('input', function() {
        app['core.form.message'].clear();
        if (! app['core.currency'].validate(this.value)) {
            app['core.form.message'].show({ form:tform, near:this, msg:'This field is required' });
        } else {
            app['core.store'].set({ id:'payoutvalue', value:this.value });
        }
    });
    
    // last payout value?
    var p = app['core.store'].get({ id:'payoutvalue' });
    if (app['core.currency'].validate(p)) payout.value=p;
    
    // add currency types
    var currency = view_purchase.querySelector('.payout >.single');
    p = app['core.store'].get({ id:'payoutcurrency' }) || 'USD';
    ['USD','EUR','GBP','AUD'].forEach(function (v) {
        var d = document.createElement('div');
        d.innerHTML=v;
        currency.insertBefore(d,payout);
        d.addEventListener('click', function() {
            Array.prototype.slice.call(currency.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
            d.className='selected';
            app['core.store'].set({ id:'payoutcurrency', value:v });
            app['binarycom.models.trade'].selected.currency = v;
        });
        
        if (p === v) {
            d.className='selected';
            app['binarycom.models.trade'].selected.currency = v
        }
        
    });
    
}

AppPluginLoaded=true;