/**
 * Created by Nathan on 8/27/2016.
 */
var urlModel = require('../model/urlModel');

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


var getShortUrl = function (longUrl, callback) {

    //to-do, 可以在front页面让用户选择不同协议
    if (longUrl.indexOf('http') === -1) {
        longUrl = 'http://' + longUrl;
    }

    urlModel.findOne({longUrl: longUrl}, function (err, url) {
        if (err) return handleError(err);
        else if (url) {
            callback(url);
        } else {
            //when shorturl is generated, need to write to db
            generateShortUrl(function (shortUrl) {
                var url = new urlModel({shortUrl: shortUrl, longUrl: longUrl});
                url.save();
                callback(url);
            });
        }
    });


    // if (longToShortHash[longUrl] != null) {
    //     return longToShortHash[longUrl];
    // }
    //
    // var shortUrl = generateShortUrl(longToShortHash);
    // longToShortHash[longUrl] = shortUrl;
    // shortToLongHash[shortUrl] = longUrl;
    // return shortUrl;
};


var generateShortUrl = function (callback) {
    urlModel.find({}, function (err, urls) {
        if (err) return handleError(err);
        callback(convertTo62(urls.length));
    });
    //return convertTo62(Object.keys(longToShortHash).length); // way to get object's length in js
};

var convertTo62 = function (num) {
    var result = '';
    do {
        result = encode[num % 62] + result;
        num = Math.floor(num / 62);
    } while (num);

    return result;
};

var getLongUrl = function (shortUrl, callback) {
    urlModel.findOne({shortUrl: shortUrl}, function (err, url) {
        if (err) return handleError(err);
        callback(url);
    });
};

module.exports = {
    getShortUrl: getShortUrl,
    getLongUrl: getLongUrl
};

