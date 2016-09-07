/**
 * Created by Nathan on 9/7/16.
 */
var SequenceModel = require('../model/sequenceModel');
var UrlModel = require('../model/urlModel');
var async = require('async');


//组装encode, 以下代码只会在初始化的时候运行
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

//HASH_SIZE
var base = encode.length;
const HASH_SIZE = Math.pow(base, 6);
const BIG_NUMBER = 28499; //need a big primary to make sure the randomicity, better than magic number "33"



//convert to 62base
var convertTo62 = function (num) {
    var result = '';
    do {
        result = encode[num % 62] + result;
        num = Math.floor(num / 62);
    } while (num);

    return result;
};

//hash to a number
var hash = function (longUrl) {
    var timestamp = new Date().getTime();

    var hashCode = 0;
    for (var i = 0; i < longUrl.length; i++) {
        hashCode = ((hashCode * BIG_NUMBER) + longUrl.charCodeAt(i)) % HASH_SIZE;
        //even if HASH_SIZE * BIG_NUMBER, STILL WON'T GET OVERFLOW
    }

    //add timestamp hash
    hashCode = (hashCode + timestamp % HASH_SIZE) % HASH_SIZE;
    return [hashCode, timestamp];//need to also return timestamp to urlservice

};


//execute convertTo62 and add padding if necessary
var convert = function (num) {
    var num62 = convertTo62(num);
    if (num62.length < 6) {
        for (var i = num62.length; i < 6; i++) {
            var padding = Math.floor((Math.random() * 62) + 1);
            var padding62 = convertTo62(padding);
            num62 = padding62 + num62;
        }
    }
    return num62;
};


//generate short url and return back to url service
var generateShortUrl = function (longUrl, callback) {

    //调用async.js实现
    async.forever(function (next) {
        var hashRes = hash(longUrl);
        var orgNumber = hashRes[0];
        var createdTime = hashRes[1];
        var shortUrl = convert(orgNumber);
        UrlModel.findOne({shortUrl: shortUrl}, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("shortURL is duplicated");
                next();
            } else {
                console.log("This shortURL " + shortUrl + " is unique!");
                next([shortUrl, createdTime]);

            }

        })
    }, function (data) {
        callback(data[0], data[1]);
    });


    // var flag = false;
    //
    // async.whilst(function (flag) {
    //     if (flag) callback(shortUrl);
    // }, UrlModel.find({shortUrl: shortUrl}, function (err, data) {
    //     if (!err && !data) {
    //         callback(shortUrl);
    //     } else {
    //         console.log(shortUrl);
    //
    //         orgNumber = hash(longUrl);
    //         shortUrl = convert(orgNumber);
    //         console.log(shortUrl);
    //     }
    // }));


    // //global sequence table
    // SequenceModel.findOne({name: 'tinyurl'}, function (err, data) {
    //     var sequentialId = 0;
    //     if (err) throw err;
    //     if (data) {
    //         sequentialId = data.sequentialId;
    //     }
    //     //要保证更新成功了在生成short url
    //     SequenceModel.findOneAndUpdate({name: 'tinyurl'}, {sequentialId: sequentialId + 1}, {upsert: true}, function (err) {
    //         if (err) throw err;
    //         callback(convertTo62(sequentialId));
    //     });
    //
    // });

    ////old version without using sequence table
    // UrlModel.count({}, function (err, count) {
    //     if (err) throw err;
    //     else callback(convertTo62(count));
    // });
    //return convertTo62(Object.keys(longToShortHash).length); // way to get object's length in js
};


module.exports = {
    generateShortUrl: generateShortUrl
};