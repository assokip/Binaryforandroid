App.prototype.oauth2 = {
	create : function(o) {
		return new oauth2(o);
	}
};


var oauth2 = function(o) {
	this.devid = o.devid;
	this.scope = o.scope;
	this.into = o.into? o.into : null,

	this.stage1 = {

		exec : function() {
			var s = o.stages[0];
			var url = s.url({ url: s.url, scope: o.scope, devid: o.devid });
			if (! o.into) {
				var ref = window.open(url, '_blank', 'location=no,menubar=no;directories=no;location=no;modal=yes');
				if (o.onWindowCreate) o.onWindowCreate(ref);
			} else {
				o.into.src = url;
			}
			
			if (s.onLoad) s.onLoad();
		}
	},
	
	this.stage2 = {
		
		exec : function(b) {
			var s = o.stages[1];
			var connection = new App.connection.create({
			    exe: s.url({ url: s.url, scope: o.scope, devid: o.devid, code:b.code }),
			    onCompletion : function(j) {
				s.onCompletion(j);
				App.events.dispatch('oauth2.token.issued');
			    }
			}).run();
		}
	}

}