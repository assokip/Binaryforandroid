function AppPlugin(app,env) {
    
    app['binarycom.charts.highstock'] = new function (o) {
        
        this.start = null;
        this.end = null;
        this.live = null;
        this.chart = null;

        var self = this;
        
        this.init = function(o) {
            
            this.start? o.start : null;
            this.end? o.end : null;
            this.live = o.live? o.live : LocalStore.get('live_chart.live') || '10min';
            
            if (this.live) {
                this.datespan.from.value = this.datespan.from.calculate(this.live);
                this.resolution.value = this.resolution.best(this.from.value, new Date().getTime()/1000);
            }
            
            this.chart = new Highcharts.StockChart({
                chart: {
                    height: o.height? o.height : 450,
                    renderTo: o.container,
                    events: {
                        load: function() { o.stream.connect() }
                    }
                },
                plotOptions: {
                    series: {
                        dataGrouping: {
                            dateTimeLabelFormats: {
                                millisecond: ['%A, %b %e, %H:%M:%S.%L GMT', '%A, %b %e, %H:%M:%S.%L', '-%H:%M:%S.%L GMT'],
                                second: ['%A, %b %e, %H:%M:%S GMT', '%A, %b %e, %H:%M:%S', '-%H:%M:%S GMT'],
                                minute: ['%A, %b %e, %H:%M GMT', '%A, %b %e, %H:%M', '-%H:%M GMT'],
                                hour: ['%A, %b %e, %H:%M GMT', '%A, %b %e, %H:%M', '-%H:%M GMT'],
                                day: ['%A, %b %e, %Y', '%A, %b %e', '-%A, %b %e, %Y'],
                                week: ['Week from %A, %b %e, %Y', '%A, %b %e', '-%A, %b %e, %Y'],
                                month: ['%B %Y', '%B', '-%B %Y'],
                                year: ['%Y', '%Y', '-%Y']
                            },
                            turboThreshold: 3000
                        }
                    },
                    candlestick: {
                        turboThreshold: 4000
                    }
                },
                xAxis: {
                    events: {
                        afterSetExtremes: function(extremes) {
                            self.config.updateRangeInputs(extremes.min, extremes.max);
                        }
                    },
                    type: 'datetime',
                    min: self.start * 1000
                },
                yAxis: {
                    title: {
                        text: null
                    }
                },
                rangeSelector: {
                    enabled: false,
                }
            });
            
        };
        

        this.switchType = function(o) {
            var chart = this.chart;
            if (this.ohlc.interval == 'tick') {
                //p.chart.type = 'line';
                p.xAxis.labels = { format: "{value:%H:%M:%S}" };
                chart.series = [{
                    name: this.symbols[this.symbol] ? this.symbols[this.symbol].label : this.symbol,
                    data: new Array(),
                    dataGrouping: {
                        enabled: false
                    },
                    id: 'primary_series',
                    tooltip: {
                        xDateFormat: "%A, %b %e, %H:%M:%S GMT"
                    },
                    type: 'line'
                }];
            } else {
                //p.chart.type = 'candlestick';
                chart.series = [{
                    name: this.symbols[this.symbol] ? this.symbols[this.symbol].label : this.symbol,
                    data: new Array(),
                    type: 'candlestick',
                    color: 'red',
                    upColor: 'green',
                    id: 'primary_series'
                }];
            }
        };
        
        this.datespan = {
            rangeInputs : null,
            from : {
                value : null,
                ctl : null,
                calculate : function(len) {
                    var now = new Date();
                    var epoch = Math.floor(now.getTime() / 1000);
                    var units = { min: 60, h: 3600, d: 86400, w: 86400 * 7, m: 86400 * 31, y: 86400 * 366 };
                    var from;
                    var res;
                    if (res == len.match(/^([0-9]+)([hdwmy]|min)$/)) {
                        from = epoch - parseInt(res[1]) * units[res[2]];
                    }
                    return from;
                }
            },
            to : {
                value : null,
                ctl : null
            },
            update : function(min, max) {
                if (this.from.ctl && this.to.ctl) {
                    this.from.ctl.setDateTime(new Date(min));
                    this.to.ctl.setDateTime(new Date(max));
                }
            }
        };
        
        this.update = function(opts) {
            if (opts.interval) {
                var from = opts.interval.from.getTime() / 1000;
                var to = opts.interval.to.getTime() / 1000;
                var length = to - from;
                this.resolution = this.bestResolution(from, to);
                delete opts.interval;
                this.datespan.from.value = from;
                this.datespan.to.value = to;
                delete this.live;
            }
            if (opts.live) {
                this.datespan.to.value=null;
                LocalStore.remove('live_chart.to');
                LocalStore.remove('live_chart.from');
                this.datespan.from.value = this.datespan.from.calculate(opts.live);
                this.live = opts.live;
                LocalStore.set('live_chart.live', opts.live);
                this.resolution.value = this.resolution.best(this.datespan.from.value, new Date().getTime()/1000);
            }
            if (opts.symbol) {
                this.symbol = opts.symbol;
                LocalStore.set('live_chart.symbol', opts.symbol);
            }
        };
        
        this.resolution = {
            value : null,
            best : function(from, to) {
                var length = to - from;
                resolution = '1d';
                for (var i = 0; i < this.variants.data.length; i++) {
                    if (this.variants.data[i].interval >= length) {
                        resolution = this.variants.data[i].resolution;
                        break;
                    }
                }
                return resolution;
            }
        };
        
        this.variants = {
            data : {
                'tick': {seconds: 0, interval: 3600},
                '1m': {seconds: 60, interval: 86400},
                '5m': {seconds: 300, interval: 7*86400},
                '30m': {seconds: 1800, interval: 31*86400},
                '1h': {seconds: 3600, interval: 62*86400},
                '8h': {seconds: 8*3600, interval: 183*86400},
                '1d': {seconds: 86400, interval: 366*3*86400}
            },
            get : function() {
                return Object.keys(this.data).map(function(a) {
                    return {
                        resolution: a,
                        interval: 2 * this.variants.data[a].interval
                    }
                }).sort(function(a,b) {
                    if (a.interval > b.interval) return 1;
                    return -1;
                });
            }
                
        };
        
        this.stream = function() {
            var $self = this;
            var url = window.location.protocol + "//" + this.server;
            var end = this.end ? "/" + this.end : "";
            url += "/stream/ticks/" + this.symbol + "/" + this.start + end + "?adjust_start_time=1&with_trades=1";
            if (this.ohlc.interval != 'tick') url += "&ohlc=" + this.ohlc.interval;
            this.ev = new EventSource(url, { withCredentials: true });
            this.ev.onmessage = function(msg) { $self.process_message(msg) };
            this.ev.onerror = function() { $self.ev.close() };
        };
    
        this.contract = {
            tradeSeries:null,
            process : function(trade) {
                if (!this.tradeSeries) {
                    this.tradeSeries = this.chart.addSeries({
                        name: "Contracts",
                        type: "flags",
                        data: [],
                        onSeries: 'primary_series',
                        shape: "circlepin"
                    }, false, false);
                }
                var epoch = 1000 * parseInt(trade.start_time);
                var text = "Contract ID: " + trade.id + "<br>" + trade.long_code;
                var color = "white";
                if (trade.is_sold) {
                    if (trade.won) {
                        text += "<br>Result: Won";
                        color = "green";
                    } else {
                        text += "<br>Result: Lost";
                        color = "red";
                    }
                }
                var cpoint = {
                    x: epoch,
                    title: "C",
                    fillColor: color,
                    text: text
                };
                this.tradeSeries.addPoint(cpoint, false, false, false);
            }
        };
        
        this.barriers = {
            
            pool : {},
            track : {},
            
            add : function(name,value) {
                this.remove(name);
                if (value.match(/^[+-]/)) {
                    this.track = {};
                    this.track[name] = parseFloat(value);
                    if (! this.spot) return;
                    value = self.config.spot + this.track[name];
                }
                self.chart.yAxis[0].addPlotLine({
                    label: this.pool[name].label,
                    value: value,
                    color: this.pool[name].color,
                    width: 2,
                    id: "barrier_" + name
                });
                self.chart.redraw();
            },
            
            remove : function(name) {
                if (name in this.track) this.track[name] = null;
                this.pool[name] = null;
                self.chart.yAxis[0].removePlotLine("barrier_" + name);
                self.chart.redraw();
            },
            
            updateTracked : function() {
                if (! Object.keys(this.track).length) return;
                Object.keys(this.track).forEach(function (t) {
                    if (typeof this.track[t] !== 'number') return;
                    this.chart.yAxis[0].removePlotLine("barrier_" + t);
                    this.chart.yAxis[0].addPlotLine({
                        label: this.pool[t].label,
                        value: self.config.spot + this.track[t],
                        color: this.pool[t].color,
                        width: 2,
                        id: "barrier_" + barrier
                    });
            
                });
            } 
        };
        
    };
    
};


AppPluginLoaded=true;