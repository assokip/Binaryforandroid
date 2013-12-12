function AppPlugin(app,env) {
    var b = env.browser;
    if (b.engine === 'ie' && parseInt(b.version) === 8) return { abort: { browser: { incompatible:true } } };
    app.binarycom = {};
}