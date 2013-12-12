function AppPlugin(app) {
    
    var sparkline = function(o) {
        
        this.canvas = document.createElement('canvas');
        this.container = o && o.container? o.container : null;
        
        this.draw = function(o) {
            
            var data = o.data;
            var canvas = this.canvas;
           
            //while (this.data.firstChild) this.data.removeChild(this.data.firstChild);
            
            var f = o.lineWidth? o.lineWidth : 2;

            var h = canvas.offsetHeight;
            var w = canvas.offsetWidth;
            
            canvas.width=w;
            canvas.height=h;
            
            var min = Math.min.apply(Math, data)-1;
            var max = Math.max.apply(Math, data)+1;
        
            var c = canvas.getContext("2d");
            c.clearRect(0,0,9999,9999);
            c.strokeStyle = o.color? o.color : 'black';
            c.lineWidth = f;
            c.beginPath();
            //c.moveTo(0, (h/2));
            //c.lineTo(w, (h/2));
        
            for (var i=0; i < data.length; i++) {
                if (i===0) c.moveTo( (w / data.length) * i, h - (((data[i] - min) / (max - min)) * h) );
                c.lineTo( (w / data.length) * i, h - (((data[i] - min) / (max - min)) * h) );
            }
        
            c.stroke();

        }
    };
        

    app['binarycom.sparkline'] = {

        create : function(o) {
            return new sparkline(o);
        }

    };

}