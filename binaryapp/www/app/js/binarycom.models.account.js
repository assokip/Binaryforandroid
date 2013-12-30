module.exports = function (app) {
    
   // var msel = \$("#market_select");
    
    app['binarycom.models.account'] = new function() {
        
        var root = this;
        
        this.data = {
            markets : {
                pool : new Array(),
                symbol : {
                    id : null,
                    spot : null
                }
            }
        };
        
       // this.chart = new app['binarycom.account.highstock']();
        
        this.init = function() {
 
            app['binarycom.navigate'].to({ view:document.querySelector('body >.main >.account'), effect:'into' });
        };
        
        
        /*
        
        
        
        ohlc : {
            
            obj : null,
            
            config : new LiveChartConfig({
                rangeInputs: {
                    from: liveChartsFromDT,
                    to: liveChartsToDT
                },
                
                live:false
            }),
            
            params : {
                
                market : null,
                symbol : null,
                
                date : {
                    from: new DateTimePicker({
                        id: "live_account_from",
                        onChange: function(date) { app['binarycom.models.account'].livechart.params.date.to.setMinDateTime(date) }
                    }),
                    to: new DateTimePicker({
                        id: "live_account_to",
                        onChange: function(date) { app['binarycom.models.account'].livechart.params.date.from.setMinDateTime(date) }
                    })
                    
                }
                
            }
            
        }
        
        
    };
    
    var c = app['binarycom.models.account'];
    
    
    var params = {

        
    };
    if (this.ohlc.interval == 'tick') {
        chart_params.chart.type = 'line';
        chart_params.xAxis.labels = { format: "{value:%H:%M:%S}" };
        chart_params.series = [{
            name: this.symbols[this.symbol] ? this.symbols[this.symbol].label : this.symbol,
            data: [],
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
        chart_params.chart.type = 'candlestick';
        chart_params.series = [{
            name: this.symbols[this.symbol] ? this.symbols[this.symbol].label : this.symbol,
            data: [],
            type: 'candlestick',
            color: 'red',
            upColor: 'green',
            id: 'primary_series'
        }];
    }
    
    c.ohlc.obj = new Highaccount.StockChart(params);
    
    
    
        
        
        //init_highchart_config();
    
    
    //\$("#instrument_span").hide();
   // \$(".notice").hide();
    //\$("#content .wrapper").css('width', '100%');
 
    //var minDT = new Date();
    //minDT.setUTCFullYear(minDT.getUTCFullYear - 3);
   
    var showChart = function() {
        liveChartsFromDT.setDateTime(new Date(liveChart.config.from * 1000));
        if (liveChartConfig.to) {
            liveChartsToDT.setDateTime(new Date(liveChart.config.to * 1000));
        } else {
            liveChartsToDT.clear();
        }

 
        \$("#market_select").val(liveChartConfig.market());
        
        update_instruments_options();
        \$("#instrument_select").val(liveChartConfig.symbol);
        show_chart_for_instrument();
        \$("#instrument_select").change(show_chart_for_instrument);
    };


    showChart();
});

        
        
        
        
        
        
        
        
    };
    
    var livechart = app['binarycom.models.account'].livechart;
    
    \$("#market_select").addEventListener('change', function() {
        
        var market = this.options[this.options.selectedIndex];
        var symbols = market.getAttribute('symbols');
        var ssel = \$("#symbols_select");
        ssel.options.length=0;
        if (! market.length) return; // really?
        symbols.forEach(function(s) {
           ssel.options[ssel.options.length] = new Option(s,s);
        });
        livechart.config.market = market;
        livechart.config.symbol = null;
    });
    
    \$("#symbol_select").addEventListener('change', function() {
        var symbol = this.options[this.options.selectedIndex];
        livechart.config.symbol = symbol;
        updateLiveChart({
            config: liveChart.config,
            server: '[% streaming_server %]'
        });
    });
    
    \$("#live_account_show_interval").addEventListener('click', function() {
        liveChart.config.update({
            interval: {
                from: liveChartsFromDT.getDateTime(),
                to: liveChartsToDT.getDateTime()
            },
            hash: 1
        });
        updateLiveChart({
            config: liveChart.config,
            server: '[% streaming_server %]'
        });
    });
    
    \$(".live_account_stream_button").addEventListener('click', function() {
        liveChartsFromDT.clear();
        liveChartsToDT.clear();
        liveChart.config.update({
            live: \$(this).data("live"),
            hash: 1
        });
        updateLiveChart({
            config: liveChart.config,
            server: '[% streaming_server %]'
        });

    });
    
    \$("#live_account_high_barrier").addEventListener('input', function() {
        var val = this.value.trim();
        if (val.length) {
            livechart.obj.addBarrier("high", val);
        } else {
            livechart.obj.removeBarrier("high");
        }
    });
    
    \$("#live_account_low_barrier").addEventListener('input', function(){
        var val = this.value.trim();
        if (val.length) {
            livechart.obj.addBarrier("low", val);
        } else {
            livechart.obj.removeBarrier("low");
        }
    });
    
    \$("#live_account_show_spot").addEventListener('change', function(){
        var val = this.value.trim();
        if (val.length) {
            livechart.obj.addBarrier("spot", "+0");
        } else {
            livechart.obj.removeBarrier("spot");
        }
    });
    
    */
    
        document.querySelector('body >.main >.account >.wrapper >.header >.back').addEventListener('click', function() { app['binarycom.models.home'].init({ effect:'back' }); });
        
        
        // abort connections
        app['core.events'].listeners.add('binarycom.navigate.to', function (o) {
            if (o.id === 'account') return;
            //var chart = app['binarycom.models.chart'];
            //var spot = trade.symbol.spot;
            //window.clearTimeout(spot.refresher);
            //spot.connection.abort();
            app['binarycom.api.offerings'].abort();
        });
    
    }

};