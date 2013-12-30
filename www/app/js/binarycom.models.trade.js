module.exports = function (app) {
    
    var mv = document.querySelector('body >.main');
    var view_options = mv.querySelector('.trade_options >.wrapper >.content');
        var markets = view_options.getElementsByClassName('markets')[0];
            var markets_c = markets.getElementsByTagName('div')[1];
        var submarkets = view_options.getElementsByClassName('submarkets')[0];
            var submarkets_c = submarkets.getElementsByTagName('div')[1];
        var symbols = view_options.getElementsByClassName('symbols')[0];
            var symbols_c = symbols.getElementsByTagName('div')[1];
    
    var view_purchase = mv.querySelector('.trade_purchase >.wrapper >.content');
        var duration = view_purchase.getElementsByClassName('duration')[0];
            var duration_c = duration.getElementsByTagName('div')[1];
        var starttime = view_purchase.getElementsByClassName('starttime')[0];
            var starttime_c = starttime.getElementsByTagName('div')[1];
        var barrier = view_purchase.getElementsByClassName('barrier')[0];
        var barriers = view_purchase.getElementsByClassName('barriers')[0];
        var barrieroffset = view_purchase.getElementsByClassName('barrieroffset')[0];

		var tform = view_purchase.getElementsByTagName('form')[0];
		var tbuy = view_purchase.getElementsByClassName('buy')[0];
		var header = view_purchase.getElementsByClassName('header')[0];


    var f = new function() {
        
        var self = this;
        var api = app['binarycom.apigee'];

        var loadingOfferings = false;
        
        this.init = function() {

            if (loadingOfferings) return;
            loadingOfferings = true;

            var evp = app['core.events'].listeners.add('binarycom.navigate','to', function (o) {
                app['binarycom.api.offerings'].abort();
            });
                
            app['binarycom.api.offerings'].get({
                statusnextto : mv.querySelector('.home >.wrapper >.menu div'),
                onEnd : function() { app['core.events'].listeners.remove(evp); loadingOfferings=false; },
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
                                                ['barrier','barrieroffset','barrierhigh','barrierlow'].forEach(function (o) {
                                                    var e = tform.elements[o];
                                                    e.setAttribute('placeholder','');
                                                    e.value='';
                                                });
												self.validate();
												self.spot.start();
												duration.style.display='none';
                                                var contracttype = view_purchase.querySelector('.contracttype').getElementsByTagName('div')[1];
                                                while(contracttype.firstChild) { contracttype.removeChild(contracttype.firstChild); };
                                                view_purchase.getElementsByClassName('contracttype')[0].style.display='block';
                                                contracttypes.forEach(function(d) {
                                                    var dc = document.createElement('div');
                                                    dc.innerHTML = d.replace(/\b./g, function(m){ return m.toUpperCase(); });
                                                    contracttype.appendChild(dc);
                                                    dc.addEventListener('click', function() {
														app['core.form.message'].clear(tform);
                                                        Array.prototype.slice.call(contracttype.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                        dc.className='selected';
                                                        self.selected.contracttype = d;
                                                        var forwardstart=false;
                                                        var intraday=false;
                                                        a.available.forEach(function(b) {
                                                            b.available.forEach(function(c) {
                                                                if (c.contract_type !== d) return;
                                                                if (c.is_forward_starting === 'Y') forwardstart = true;
																if (c.expiry_type === 'intraday') intraday = true;
                                                            });
                                                        });

														self.selected.duration=null;
		                                                Array.prototype.slice.call(duration_c.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
                                                
														tform.elements['duration'].value='';
														tform.elements['duration'].disabled=true;
														Array.prototype.slice.call(duration_c.getElementsByTagName('div')).forEach(function(v) { if (v.getAttribute('data-name') !== 'days') v.className=intraday?'':'disabled'; });
														if (! intraday) duration_c.getElementsByTagName('div')[0].click();

                                                        // this is crap: the api doesn't specify barrier info
														self.available.barrier = self.available.barriers = self.available.barrieroffset = self.available.starttime = false;
                                                        tform.elements['barrier'].value=tform.elements['barrieroffset'].value=tform.elements['barrierhigh'].value=tform.elements['barrierlow'].value='';
                                                        if (forwardstart) self.available.starttime = true;
                                                        self.available.barriers=d.search('between') != -1 || d.search('outside') != -1? true : false;
                                                        self.available.barrieroffset=d.search('touch') != -1? true : false;
                                                        self.available.barrier=['higher','lower'].indexOf(d) !== -1? true : false;
														duration.style.display='';
														self.validate();
														
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
        };
        
        this.spot = {
			refresher : null,
			history : null,
			connection : new app['core.connection.xhr']({
				exe : api.url.get(),
				statusnextto : header.getElementsByClassName('spot')[0],
				headers : {
					'Authorization' : function() {
						var a = api.status.get();
						return a? 'Bearer '+ a.token : '';
					}
				}
			}),

			start : function() {
				//var sd = header.getElementsByClassName('sparkline')[0];
				this.history = new Array();
				var spot = this;
				//if (! sd.hasChildNodes()) sd.appendChild(this.sparkline.canvas);
				var sp = this.connection;
				sp.resource = '/symbols/'+self.selected.symbol.replace(/\//g,'-')+'/price';
				var v = header.getElementsByClassName('spot')[0];
				v.innerHTML='';
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
					spot.refresher = setTimeout(function() { sp.run() },1500);
					$('.sparkline').sparkline(
						spot.history.slice(spot.history.length-30 < 0? 0: spot.history.length-30),
						{
							type: 'line',
							lineColor: '#606060',
							fillColor: false,
							spotColor: '#00f000',
							minSpotColor: '#f00000',
							maxSpotColor: '#0000f0',
							highlightSpotColor: '#ffff00',
							highlightLineColor: '#000000',
							spotRadius: 1.25
						}
					);
				}
				sp.run();
			},

			stop : function() {
				$('.sparkline').sparkline([], {});
				if (this.refresher) window.clearTimeout(this.refresher);
				this.connection.abort();
			}

        };

		this.contract = {

			refresher : null,
			
			connection : new app['core.connection.xhr']({
				exe : api.url.get(),
				statusnextto : tbuy.getElementsByClassName('price')[0],
				headers : {
					'Authorization' : function() {
						var a = api.status.get();
						return a? 'Bearer '+ a.token : '';
					}
				}
			}),

			start : function() {
				tbuy.style.display = 'block';
				var contract = this;
				var price = tbuy.getElementsByClassName('price')[0];
				var button = tbuy.getElementsByTagName('input')[0];
				var sp = this.connection;
				sp.resource = '/contract/';
				var selected = self.selected;
				sp.resource += selected.contracttype+'/'+selected.symbol+'/sec/';
				var dur = parseInt(tform.elements['duration'].value.trim());
				var d = selected.duration;
				if (d === 'minutes') dur = dur * 60;
				else if (d === 'hours') dur = dur * 3600;
				else if (d === 'days') dur = dur * 86400;

				sp.resource += dur+'/'+selected.currency+'/'+tform.elements['payout'].value.trim();
				
				var d = tform.elements['starttime_minutes'].options[tform.elements['starttime_minutes'].selectedIndex].value * 60;
				d += tform.elements['starttime_hours'].options[tform.elements['starttime_hours'].selectedIndex].value * 3600;
				d += tform.elements['starttime_days'].options[tform.elements['starttime_days'].selectedIndex].value * 86400;
				sp.resource += '/'+d+'/';

				if (barrier.style.display !== 'none') {
					var v = parseInt(tform.elements['barrier'].value.trim());
					sp.resource += 'S'+v+'P'+'/S'+v+'P';
				} else if (barrieroffset.style.display !== 'none') {
					var v = parseInt(tform.elements['barrieroffset'].value.trim());
					sp.resource += 'S'+v+'/S'+v+'P';
				} else if (barriers.style.display !== 'none') {
					sp.resource += 'S'+parseInt(tform.elements['barrierlow'].value.trim())+'P/S'+parseInt(tform.elements['barrierhigh'].value.trim())+'P';
				}

				var init = function() {
					price.innerHTML='';
					button.disabled = true;
					sp.run();
				};

				sp.onCompletion = function(k) {
					price.innerHTML = JSON.stringify(k);
					button.disabled = false;
					contract.refresher = setTimeout(init,2000);
				}
				init();
			},

			stop : function() {
				if (this.refresher) window.clearTimeout(this.refresher);
				this.connection.abort();
				tbuy.style.display = 'none';
			}

		}

		this.selected = {
			market:null,
	        symbol:null,
	        submarket:null,
	        contracttype:null,
	        currency:null,
			duration:null,
			barrieroffset:null
		};

		this.available = {
			barriers:null,
			barrieroffset:null,
			barrier:null,
			starttime:null,

		};
		
		this.validate = null;

    };

	app['binarycom.models.trade'] = f;

    // back buttons
    mv.querySelector('.trade_options >.wrapper >.header >.back').addEventListener('click', function() {
		app['binarycom.models.home'].init({ effect:'back' });
    });
    mv.querySelector('.trade_purchase >.wrapper >.header >.back').addEventListener('click', function() {
		f.show({ effect:false });
    });

    // abort connections
    app['core.events'].listeners.add('binarycom.navigate','to', function (o) {
        if (o.id === 'trade_purchase') return;
        var trade = app['binarycom.models.trade'];
        f.contract.stop();
		f.spot.stop();
        app['binarycom.api.offerings'].abort();
    });
    
    // populate hours and minutes
    var sh = tform.elements['starttime_days'];
    for (var i=0; i <= 14; i++) {
        sh.options[sh.options.length] = new Option(i,i);
    }
    sh = tform.elements['starttime_hours'];
    for (var i=0; i <= 60; i++) {
        sh.options[sh.options.length] = new Option(i<10? '0'+i : i,i);
    }
    sh = tform.elements['starttime_minutes'];
    for (var i=0; i <= 60; i+=15) {
        sh.options[sh.options.length] = new Option(i<10? '0'+i : i,i);
    }

	// validation
	var vld = f.validate = function() {

		if (this.disabled || this.className==='disabled') return;

		tbuy.style.display=starttime.style.display=barrier.style.display=barriers.style.display=barrieroffset.style.display='none';

		f.contract.stop();

		var frmmsg = app['core.form.message'];
		frmmsg.clear(tform);
		var ele = tform.elements['payout'];
		var v = ele.value.trim();
		if (! v.length) {
			frmmsg.show({ form:tform, near:ele, msg:'Value required' });
			return;
		}
        if (! app['core.currency'].validate(v)) {
            frmmsg.show({ form:tform, near:ele, msg:'Invalid amount' });
			return;
        }
		if (! f.selected.contracttype) return;
		
		var dur = f.selected.duration;
		if (! dur) return;
		var ele = tform.elements['duration'];
		var v = ele.value.trim();
		if (! v.length) {
			frmmsg.show({ form:tform, near:ele, msg:'Value required' });
			return;
		}
		var n = /^[0-9]+$/;
		if (! v.match(n)) {
			frmmsg.show({ form:tform, near:ele, msg:'Invalid value' });
			return;
		}
		if (dur === 'seconds' && v < 15) {
			frmmsg.show({ form:tform, near:ele, msg:'Minimum value is 15' });
			return;
		}
		
		if (f.available.starttime) starttime.style.display = 'block';

		if (f.available.barrier) {
			barrier.style.display = 'block';
			var ele = tform.elements['barrier'];
			var v = ele.value.trim();
			if (! v.length) {
				frmmsg.show({ form:tform, near:ele, msg:'Value required' });
				return;
			}
			if (isNaN(v) || v < 0) {
				frmmsg.show({ form:tform, near:ele, msg:'Invalid value' });
				return;
			}
		};

		if (f.available.barrieroffset) {
			barrieroffset.style.display = 'block';
			var ele = tform.elements['barrieroffset'];
			var v = ele.value.trim();
			if (! v.length) {
				frmmsg.show({ form:tform, near:ele, msg:'Value required' });
				return;
			}
			if (isNaN(v) || v < 0) {
				frmmsg.show({ form:tform, near:ele, msg:'Invalid value' });
				return;
			}
		};

		if (f.available.barriers) {
			barriers.style.display = 'block';
			var ele1 = tform.elements['barrierlow'];
			var ele2 = tform.elements['barrierhigh'];
			var v1 = ele.value.trim();
			var v2 = ele2.value.trim();

			if (! v1.length) {
				frmmsg.show({ form:tform, near:ele1, msg:'Value required' });
				return;
			}
			if (isNaN(v1) || v1 < 0) {
				frmmsg.show({ form:tform, near:ele1, msg:'Invalid value' });
				return;
			}
			if (! v2.length) {
				frmmsg.show({ form:tform, near:ele2, msg:'Value required' });
				return;
			}
			if (isNaN(v2) || v2 < 0) {
				frmmsg.show({ form:tform, near:ele2, msg:'Invalid value' });
				return;
			}
			if (v1 >= v2) {
				frmmsg.show({ form:tform, near:ele2, msg:'Invalid range' });
				return;
			}

		};

		f.contract.start();
    
    };

	// payout
	var payout = tform.elements['payout'];
	var p = app['core.store'].get('binarycom.models.trade','payoutvalue');
	if (app['core.currency'].validate(p)) payout.value=p;
	payout.addEventListener('input', function() {
		if (! app['core.currency'].validate(this.value)) app['core.store'].set('binarycom.models.trade', 'payoutvalue', payout.value);
		vld();	
	});

    // add currency types
    var currency = view_purchase.querySelector('.payout >.single');
    var p = app['core.store'].get('binarycom.models.trade','payoutcurrency') || 'USD';
    ['USD','EUR','GBP','AUD'].forEach(function (v) {
        var d = document.createElement('div');
        d.innerHTML=v;
        currency.insertBefore(d,payout);
        d.addEventListener('click', function() {
            Array.prototype.slice.call(currency.getElementsByTagName('div')).forEach(function(v) { v.className=''; });
            d.className='selected';
            app['core.store'].set('binarycom.models.trade','payoutcurrency', v);
            f.selected.currency = v;
        });
        if (p === v) {
            d.className='selected';
            f.selected.currency = v
        }
    });

	// duration
	var d = tform.elements['duration'];
    Array.prototype.slice.call(duration_c.getElementsByTagName('div')).forEach(function(v) {
        v.addEventListener('click',function(o) {
			if (this.className==='disabled') return;
            Array.prototype.slice.call(duration_c.getElementsByTagName('div')).forEach(function(h) { if (h.className==='selected') h.className=''; }); 
			this.className='selected';
			f.selected.duration = this.getAttribute('data-name');
			d.disabled=false;
			d.focus();
			vld();
        });
	});
	d.addEventListener('input',  function() { vld(); });

	// barriers
	tform.elements['barrier'].addEventListener('input', function() { vld(); });
	tform.elements['barrieroffset'].addEventListener('input', function() { vld(); });
	tform.elements['barrierhigh'].addEventListener('input', function() { vld(); });
	tform.elements['barrierlow'].addEventListener('input',  function() { vld(); });

	// purchase
	tbuy.getElementsByTagName('input')[0].addEventListener('click', function() {
		if (! app['binarycom.safety'].mode.get()) {
			if (! confirm('Are you sure you want to purchase this trade?\n\n(You can disable this safety message in settings.)')) return;
		}
		alert('Sorry, the API doesn\'t allow this yet...');
	});

    
};