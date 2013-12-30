function AppPlugin(app,env) {
    var b = env.browser;
    if (b.engine === 'ie' && parseInt(b.version) < 9) return { abort: { incompatible:true } };
}

AppPluginLoaded=true;