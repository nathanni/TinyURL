/**
 * Created by Nathan on 9/7/16.
 */

var dictionary = require('./dictionary');
var emojione = require('../node_modules/emojione/lib/js/emojione.js');
var UrlModel = require('../model/urlModel');
var redis = require('redis');

//redis config
//docker 再创建实例的时候会传入这两个参数
var host = process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1';
var port = process.env.REDIS_PORT_6379_TCP_PORT || '6379';
var redisClient = redis.createClient(port, host);

var generateEmojiUrl = function (shortUrl, callback) {

    var emojiUrl = '';

    //根据shortUrl生成对应的emoji
    for (var i = 0; i < shortUrl.length; i++) {
        emojiUrl += dictionary.codeToEmoji[shortUrl[i]];
    }
    var prefix = '';
    var suffix = '';

    //随机组装prefix and suffix, 提高url丰富度
    for (var i = 0; i < 3; i++) {
        var randomPrefix = Math.floor((Math.random() * dictionary.prefix.length));
        var randomSuffix = Math.floor((Math.random() * dictionary.suffix.length));
        prefix += dictionary.prefix[randomPrefix];
        suffix += dictionary.suffix[randomSuffix];
    }


    emojiUrl = prefix + '.' + emojiUrl + '.' + suffix;
    callback(emojiUrl);

};


var generateShortUrlFromEmoji = function (orgUrl, callback) {

    try {
        orgUrl = decodeURIComponent(orgUrl);
    } catch (e) {
        callback();
    }

    var emojiShortNames = emojione.toShort(orgUrl);


    redisClient.get(emojiShortNames, function (err, shortUrl) {
        if(err) callback();
        if (shortUrl) {
            console.log("byebye mongodb: emojiUrl");
            callback(shortUrl);
        } else {
            UrlModel.findOne({emojiUrl: emojiShortNames}, function (err, url) {
                if (err) callback();
                else if(url) {
                    redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                    redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                    redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                    redisClient.hset(url.shortUrl, 'emojiUrl', url.emojiUrl);
                    redisClient.hset(url.user, url.longUrl, url.shortUrl);
                    redisClient.set(url.emojiUrl, url.shortUrl);
                    callback(url.shortUrl);
                } else {
                    callback();
                }

            });
        }

    });




    // var split = orgUrl.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);
    // if (split.length < 2) {
    //     callback(orgUrl);
    // } else {
    //     var arr = [];
    //     for (var i = 0; i < split.length; i++) {
    //         var char = split[i];
    //         if (char !== "") {
    //             arr.push(char);
    //         }
    //     }
    //
    //     var shortUrl = '';
    //     for (var i = 0; i < arr.length; i++) {
    //         var shortName = emojione.toShort(arr[i]);
    //         if (dictionary.emojiToCode[shortName]) {
    //             shortUrl += dictionary.emojiToCode[shortName];
    //         }
    //     }
    //
    //     callback(shortUrl);
    // }


};


module.exports = {
    generateEmojiUrl: generateEmojiUrl,
    generateShortUrlFromEmoji: generateShortUrlFromEmoji
};