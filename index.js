require("babel-polyfill");

var Datum = require('./lib/datum');

if (typeof window !== 'undefined' && typeof window.Datum === 'undefined') {
    window.Datum = Datum;
}

module.exports = Datum;
