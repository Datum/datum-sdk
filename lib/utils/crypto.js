const sjcl = require('sjcl');


var encryptPrivate = function (obj, secret, authData = "0x5297530a87b7a9d5acc3a247514e909442ca7e59") {
    
    rp = {};

    var mode = {
        adata: authData,
        iter: 1000,
        mode: "gcm",
        ts: 64,
        ks: 256
    };

    var q = sjcl.encrypt(secret, obj, mode, rp).replace(/,/g,",\n");
    return q;
}

var decryptPrivate = function (g, secret, adata = "0x5297530a87b7a9d5acc3a247514e909442ca7e59") {
    rp = {};
    return sjcl.decrypt(secret,g, {}, rp);
}

var createPassword = function(len) {
    var length = (len)?(len):(10);
    var string = "abcdefghijklmnopqrstuvwxyz";
    var numeric = '0123456789';
    var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
    var password = "";
    var character = "";
    var crunch = true;
    while( password.length<length ) {
        entity1 = Math.ceil(string.length * Math.random()*Math.random());
        entity2 = Math.ceil(numeric.length * Math.random()*Math.random());
        entity3 = Math.ceil(punctuation.length * Math.random()*Math.random());
        hold = string.charAt( entity1 );
        hold = (password.length%2==0)?(hold.toUpperCase()):(hold);
        character += hold;
        character += numeric.charAt( entity2 );
        character += punctuation.charAt( entity3 );
        password = character;
    }
    password=password.split('').sort(function(){return 0.5-Math.random()}).join('');
    return password.substr(0,len);
}


module.exports = {
    encrypt: encryptPrivate,
    decrypt: decryptPrivate,
    createPassword : createPassword
};
