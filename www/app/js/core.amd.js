module.exports = function (app) {

    if (typeof XMLHttpRequest === 'undefined' && document.readyState === "complete") throw new Error({ incompatible:true, noobject:'XMLHttpRequest' });;

    app['core.amd'] = function(p) {

        var aborting = false;
        var threads = new Array();
        var onProgress = function() {
            var total=0; var loaded=0;
            for (var i=0; i<threads.length;i++) {
                loaded += threads[i].loaded.length;
                total += threads[i].total;
            }
            if (p.onProgress) p.onProgress(Math.round((loaded/total)*100));
            if (loaded === total && p.onCompletion) p.onCompletion();
        }
        var onError = function(worker,e) {
            aborting=true;
            for (var i=0; i<threads.length;i++) {
                var thread = threads[i];
                for (var j=0; j < thread.workers.length; j++) { thread.workers[j].abort(); }
            }
            e.worker = worker;
            if (p.onError) p.onError(e);
        }
        var worker = function(o) {
            var self = this;
            var mod = this.module = o.module;
            this.fullpath= ! mod.path && o.path? o.path : '';
            var type = this.type = o.type;
            var xhr = this.xhr = new XMLHttpRequest();
            this.fullpath += '/'+mod.name+(mod.minified? '.min' : '') + '.'+type;
            this.abort = function() { xhr.abort() };
            xhr.onreadystatechange = function() {
                if (xhr.readyState !== 4) return;
                if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
                    var res = xhr.responseText;
                    if (type === 'js') {
                        try {
                            var module = {};
                            eval(res);
                            if (module.exports) module.exports(app);
                        }
                        catch(e) { onError(self,e); return; }
                    } else if (type === 'css') {
                        var sty = document.createElement('style');
                        sty.innerHTML = res;
                        document.body.appendChild(sty);
                    }
                    if (mod.onCompletion) mod.onCompletion(self,xhr.responseText);
                    o.onCompletion(self,xhr.responseText);
                } else if (! aborting) {
                    onError(self, { status:xhr.status });
                }
            }
            xhr.open('GET', this.fullpath, true);
            xhr.send();
            if (mod.onLoading) mod.onLoading();
        };
        var thread = function(grp) {
            this.queued = new Array();
            this.workers = new Array();
            this.loaded = new Array();
            this.total = grp.modules.length;
            var self = this;
            var onCompletion = function(o) {
                self.loaded.push(o.module.name);
                self.workers.splice(self.workers.indexOf(o),1);
                onProgress();
                if (o.module.onCompletion) o.module.onCompletion(self);
                var queue = self.queued;
                for (var i=0; i < queue.length; i++) {
                    var found=true;
                    var requires = queue[i].requires;
                    for (var j=0; j < requires.length; j++) {
                        if (self.loaded.indexOf(requires[j]) === -1) {
                            found=false;
                            break;
                        }
                    }
                    if (! found) continue;
                    self.workers.push(new worker({ module:queue[i], type:grp.type, onCompletion:onCompletion, path:grp.path }));
                    self.queued.splice(i,1);
                }
            }
            for (var i=0; i < grp.modules.length; i++) {
                if (grp.modules[i].requires) {
                    this.queued.push(grp.modules[i]);
                } else {
                    this.workers.push(new worker({ module:grp.modules[i], type:grp.type, onCompletion:onCompletion, path:grp.path }));
                }
            }
        }
        var pj = p.modules;
        for(var i=0; i<pj.length; i++) { threads.push(new thread(pj[i])); }
        return true;
    };

};
