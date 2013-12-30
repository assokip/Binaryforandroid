/* core typically requires javascript 1.8.5 (IE 10)

You can load the polyfill classes to work around this,
but then you'll have to deal with deficiences such as
replacing the css3 animation (instead of gif's).

*/

module.exports = function(app) {

    if (! Object.keys) throw new Error({
        incompatible:true,
        js:1.85
    });

};
