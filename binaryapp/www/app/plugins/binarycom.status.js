function AppPlugin(app) {
    
    var stc = document.createElement('div');
    stc.className = 'status';
    document.body.appendChild(stc);
    stc.addEventListener('click', function() {
        app.binarycom.status.remove();
        this.style.display='none';
    });

    app.binarycom.status = {
        
        pool : new Array(),
        remove : function(l) {
            var f = function(v) {
                try {
                    var nav = stc.getElementsByTagName('nav')[0];
                    var ul = nav.getElementsByTagName('ul')[0];
                    ul.removeChild(v);
                    if (! ul.hasChildNodes()) {
                        stc.removeChild(nav);
                        stc.style.display='none';
                    }
                } catch (e) {};
            }
            if (l) {
                var i = this.pool.indexOf(l);
                if (i === -1) return;
                f(l);
                this.pool.splice(i,1);
            } else {
                this.pool.forEach(function (o) { f(l) });
                this.pool.length=0;
            }
        },
        append : function(o) {
            var ul;
            var self = this;
            if (! this.pool.length) {
                var nav = document.createElement('nav');
                stc.appendChild(nav);
                ul = document.createElement('ul');
                nav.appendChild(ul);
            } else {
                ul = stc.getElementsByTagName('nav')[0].getElementsByTagName('ul')[0];
            }
            var kl = document.createElement('li');
            this.pool.push(kl);
            stc.style.display='block';
            ul.appendChild(kl);
                var aa = document.createElement('div');
                aa.className='type';
                kl.appendChild(aa);
                    var aaa = document.createElement('div');
                    aaa.className=o.type? o.type : 'warn';
                    aa.appendChild(aaa);
                var ab = document.createElement('div');
                ab.className='details';
                kl.appendChild(ab);
                var aba = document.createElement('div');
                    aba.className=o.id? o.id : 'standard';
                    ab.appendChild(aba);
                    if (o.title) {
                        var g = document.createElement('div');
                        g.className='title';
                        g.innerHTML=o.title;
                        aba.appendChild(g);
                    }
                    o.lines.forEach(function (t) {
                        var g = document.createElement('div');
                        g.className='line';
                        g.innerHTML=t;
                        aba.appendChild(g);
                    });
            setTimeout(function() { self.remove(kl) }, 6000);
        }

    };
};