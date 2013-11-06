App.prototype.oauth2 = {
	
	create : function(o) {
		return new oauth2(o);
	}
 
};


var oauth2 = function(o) {
	this.devid = o.devid;
	this.scope = o.scope;
	this.url = o.url;
	this.token = null;
	this.params = null;
	
	this.stage1 = function(o) {
		
		var url = App.oauth2.url+'/login?scope='+App.oauth2.scope+'&client_id='+App.oauth2.devid;
		App.oauth2.status.getElementsByClassName('init')[0].style.display='none';
		App.oauth2.status.getElementsByClassName('stage1')[0].style.display='block';
		if (App.cordova.loaded) {
		    var ref = window.open(url, '_blank', 'location=no');
		    ref.addEventListener('loadstop', function(event) {
			if (event.url === url) return;
			var a = App.url.param.get('code',event.url);
			ref.close();
			App.oauth2.stage2.exec({ authcode:a });
		    });
		} else {
		    var iframe = document.body.getElementsByTagName('iframe')[0];
		    iframe.src = url;
		    iframe.style.display='block';
		    iframe.addEventListener('message', function(m) {
			alert(m);
			alert(m.url);
			iframe.style.display='none';
			var a = App.url.param.get('code',event.url);
			App.oauth2.stage2.exec({ authcode:a });
		    });
		}
	
		//win.addEventListener('close', function(event) { App.exit(); });
	},
	
	this.stage2 = function(o) {
		App.oauth2.status.getElementsByClassName('stage1')[0].style.display='none';
		App.oauth2.status.getElementsByClassName('stage2')[0].style.display='block';
		var connection = new igaro_connection({
		    exe: App.oauth2.url+'/tokenswap',
		    vars : { scope:App.oauth2.scope, code:o.authcode },
		    onCompletion : function(j) {
			App.oauth2.params = j.params;
			App.events.dispatch('security.oauth2.token.issued');
			App.navigate.to({ view:document.querySelector('body >.wrapper >.main') });
			document.querySelector('body >.wrapper >.main >.wrapper >.login_id').innerHTML = j.params.login_id;
		    }
		});
		connection.run();
	}

}