/**
 * Created by Nathan on 8/27/2016.
 */
var UrlModel = require('../model/urlModel');
var RequestModel = require('../model/requestModel');
var urlHash = require('./urlHash');
var emojiUrl = require('../emoji/emojiUrl');
var errorHandler = require('./errorHandler');
var redis = require('redis');


//redis config
//docker 再创建实例的时候会传入这两个参数
var host = process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1';
var port = process.env.REDIS_PORT_6379_TCP_PORT || '6379';
var redisClient = redis.createClient(port, host);


//get or generate short url from long url
var getShortUrl = function (user, longUrl, callback) {

    //to-do, 可以在front页面让用户选择不同协议
    if (longUrl.indexOf('http') === -1) {
        longUrl = 'http://' + longUrl;
    }

    redisClient.hget(user, longUrl, function (err, shortUrl) {

        var mongoCallback = function () {
            UrlModel.findOne({user: user, longUrl: longUrl}, function (err, url) {
                if (err) errorHandler.handleError(err, callback);
                else if (url) {
                    redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                    redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                    redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                    redisClient.hset(url.shortUrl, 'emojiUrl', url.emojiUrl);
                    redisClient.hset(url.user, url.longUrl, url.shortUrl);
                    redisClient.set(url.emojiUrl, url.shortUrl);
                    callback(url);
                } else {
                    //when shorturl is generated, need to write to db
                    urlHash.generateShortUrl(longUrl, function (err, shortUrl, createdTime) {
                        if (err) errorHandler.handleError(err, callback);
                        emojiUrl.generateEmojiUrl(shortUrl, function (emojiUrl) {
                            var url = new UrlModel({
                                user: user,
                                createdTime: new Date(createdTime),
                                longUrl: longUrl,
                                shortUrl: shortUrl,
                                emojiUrl: emojiUrl
                            });
                            url.save(); // save to mongoDB
                            callback(url);
                        });

                    });
                }
            });
        };


        //TO-DO 其实这里对缓存的调用可以优化, 只要查到shortUrl就能直接返回了, 这么做只是为了保证缓存的一致性
        //用FLAG保证了如果cache出错, 还一定会走mongodb
        if (err) errorHandler.handleError(err, callback);
        else if (shortUrl) {
            redisClient.hmget(shortUrl, 'createdTime', 'emojiUrl', function (err, data) {
                if (err) errorHandler.handleError(err, callback);
                else if (data.length == 2 && data[0] && data[1]) {
                    console.log("byebye mongodb: getShortUrl");
                    callback({
                        user: user,
                        createdTime: data[0],
                        longUrl: longUrl,
                        shortUrl: shortUrl,
                        emojiUrl: data[1]
                    });
                } else {
                    mongoCallback();
                }
            });

        } else {
            mongoCallback();
        }


    });

};


//get urlinfo from short url
var getLongUrl = function (user, shortUrl, callback) {

    redisClient.hgetall(shortUrl, function (err, obj) {
        if (err) errorHandler.handleError(err, callback);
        else if (obj) {
            console.log("byebye mongodb: getLongUrl");
            // 3 restrictions
            // not dummy from redirect
            // not user equals
            // not user is user and obj.user is guest
            if (user != '______dummy$#%' && obj.user != user && !(user != '______guest$#%' && obj.user === '______guest$#%')) {
                callback();
            } else {
                callback({
                    user: obj.user,
                    createdTime: obj.createdTime,
                    longUrl: obj.longUrl,
                    shortUrl: shortUrl,
                    emojiUrl: obj.emojiUrl

                });
            }


        } else {
            UrlModel.findOne({shortUrl: shortUrl}, function (err, url) {
                if (err) errorHandler.handleError(err, callback);
                else if (url) {
                    redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                    redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                    redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                    redisClient.hset(url.shortUrl, 'emojiUrl', url.emojiUrl);
                    redisClient.hset(url.user, url.longUrl, url.shortUrl);
                    redisClient.set(url.emojiUrl, url.shortUrl);
                    if (user != '______dummy$#%' && url.user != user && !(user != '______guest$#%' && url.user === '______guest$#%')) {
                        callback();
                    } else {
                        callback(url);
                    }
                } else {
                    callback();
                }

            });
        }
    });


};


//TO DO 缓存
//get all urls
var getUrls = function (user, callback) {

    UrlModel.find({user: user}, function (err, urls) {
        if (err) errorHandler.handleError(err, callback);
        callback(urls);
    });

};


//delete url
var deleteUrl = function (user, shortUrl, callback) {
    UrlModel.findOneAndRemove({user: user, shortUrl: shortUrl}, function (err, url) {
        if (err) errorHandler.handleError(err, callback);
        else if (url) {
            //need to delete cache
            redisClient.hdel(user, url.longUrl);
            redisClient.hdel(shortUrl, 'longUrl');
            redisClient.hdel(shortUrl, 'user');
            redisClient.hdel(shortUrl, 'createdTime');
            redisClient.hdel(shortUrl, 'emojiUrl');
            redisClient.del(url.emojiUrl);
            console.log("url is removed: " + url);
            callback({success: true});
        } else {
            callback({success: false});
        }
    });

    //delete from requestModel DB
    RequestModel.remove({shortUrl: shortUrl}, function (err) {
        if (err) errorHandler.handleError(err, callback);
    })

};


module.exports = {
    getShortUrl: getShortUrl,
    getLongUrl: getLongUrl,
    getUrls: getUrls,
    deleteUrl: deleteUrl
};

