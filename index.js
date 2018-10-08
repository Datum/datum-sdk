require("babel-polyfill");
const sjcl = require("sjcl");

var Datum = require("./lib/datum");

if (typeof window !== "undefined"&& typeof window.Datum === "undefined")
{
    window.Datum = Datum;
}else{
    /**
     * Enhance entropy in case SDK is loaded on none browser environment
     */
    sjcl.random.startCollectors();
}
module.exports = Datum;
