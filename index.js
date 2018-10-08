require("babel-polyfill");
const sjcl = require("sjcl");

var Datum = require("./lib/datum");

if (typeof window !== "undefined")
{
    /**
     * Increase enropy in case of browser environment
     */
    sjcl.random.startCollectors();

    if(window.Datum === "undefined")
        window.Datum = Datum;
}
module.exports = Datum;
