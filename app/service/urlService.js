/**
 * Created by Nathan on 8/27/2016.
 */
var encode = [];

var genCharArray = function (charA, charZ) {
    var arr = [];
    var i = charA.charCodeAt(0);
    var j = charZ.charCodeAt(0);

    for (; i <= j; i++) {
        arr.push(String.fromCharCode(i));
    }
    return arr;
};

encode = encode.concat(genCharArray('A', 'Z'));
encode = encode.concat(genCharArray('0', '9'));
encode = encode.concat(genCharArray('a', 'z'));





var getShortUrl = function (longUrl, longToShortHash, shortToLongHash) {

    //to-do, 可以在front页面让用户选择不同协议
    if (longUrl.indexOf('http') === -1) {
        longUrl = 'http://' + longUrl;
    }

    if (longToShortHash[longUrl] != null) {
        return longToShortHash[longUrl];
    }

    var shortUrl = generateShortUrl(longToShortHash);
    longToShortHash[longUrl] = shortUrl;
    shortToLongHash[shortUrl] = longUrl;
    return shortUrl;
};


var generateShortUrl = function (longToShortHash) {
    return convertTo62(Object.keys(longToShortHash).length); // way to get object's length in js
};

var convertTo62 = function (num) {
    var result = '';
    do {
        result = encode[num % 62] + result;
        num = Math.floor(num / 62);
    } while (num);

    return result;
};

var getLongUrl = function (shortUrl, shortToLongHash) {
    return shortToLongHash[shortUrl];
};

module.exports = {
    getShortUrl: getShortUrl,
    getLongUrl: getLongUrl
};

