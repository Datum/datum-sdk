require("babel-polyfill");
const sjcl = require("sjcl");
/**
 * Starting collectors before requiring datum in case of browser environment
 */
if(typeof window !== "undefined"){
    sjcl.random.startCollectors();
}

var Datum = require("./lib/datum");
if (typeof window !== "undefined" && typeof window.Datum === "undefined") {
    window.Datum = Datum;
}

module.exports = Datum;
