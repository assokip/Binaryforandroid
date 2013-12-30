module.exports = function (app) {
    
    var stc = document.createElement('div');
    stc.className = 'binarycom-status';
    stc.addEventListener('click', function() {
        document.body.removeChild(stc);
    });
    var nav = document.createElement('nav');
    stc.appendChild(nav);
    var ul = document.createElement('ul');
    nav.appendChild(ul);
    
    app['binarycom.status'] = {
        pool : new Array(),
        remove : function(l) {
            if (l) {
                var i = this.pool.indexOf(l);
                if (i === -1) return;
                if (l.parentNode === ul) ul.removeChild(l);
                this.pool.splice(i,1);
            } else {
                this.pool.forEach(function (o) { ul.removeChild(o) });
            }
            if (! ul.hasChildNodes() && stc.parentNode) document.body.removeChild(stc);
        },
        append : function(o) {
            var self = this;
            var kl = document.createElement('li');
            this.pool.push(kl);
            if (! stc.parentNode) document.body.appendChild(stc);
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