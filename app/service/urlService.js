/**
 * Created by Nathan on 8/27/2016.
 */
var UrlModel = require('../model/urlModel');
var RequestModel = require('../model/requestModel');
var urlHash = require('./urlHash');
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
                if (err) throw err;
                else if (url) {
                    redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                    redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                    redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                    redisClient.hset(url.user, url.longUrl, url.shortUrl);
                    callback(url);
                } else {
                    //when shorturl is generated, need to write to db
                    urlHash.generateShortUrl(longUrl, function (shortUrl, createdTime) {
                        var url = new UrlModel({
                            user: user,
                            createdTime: new Date(createdTime),
                            shortUrl: shortUrl,
                            longUrl: longUrl
                        });
                        url.save(); // save to mongoDB
                        callback(url);
                    });
                }
            });
        };


        //用FLAG保证了如果cache出错, 还一定会走mongodb
        if (!err && shortUrl) {
            redisClient.hget(shortUrl, 'createdTime', function (err, createdTime) {
                if (!err && createdTime) {
                    console.log("byebye mongodb: getShortUrl");
                    callback({
                        user: user,
                        createdTime: createdTime,
                        longUrl: longUrl,
                        shortUrl: shortUrl
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
        if (!err && obj) {
            console.log("byebye mongodb: getLongUrl");
            // not dummy from redirect
            // not user equals
            // not user is user and obj.user is guest
            if (user != '______dummy$#%' && obj.user != user && !(user != '______guest$#%' && obj.user === '______guest$#%')) {
                callback();
            } else {
                callback({
                    user: obj.user,
                    createdTime: obj.createdTime,
                    shortUrl: shortUrl,
                    longUrl: obj.longUrl
                });
            }


        } else {
            UrlModel.findOne({shortUrl: shortUrl}, function (err, url) {
                if (err) throw err;
                else if (url) {
                    redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                    redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                    redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                    redisClient.hset(url.user, url.longUrl, url.shortUrl);
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


//get all urls
//to-do cache
var getUrls = function (user, callback) {
    UrlModel.find({user: user}, function (err, urls) {
        if (err) throw err;

        callback(urls);
    })
};


//delete url
var deleteUrl = function (user, shortUrl, callback) {
    UrlModel.findOneAndRemove({user: user, shortUrl: shortUrl}, function (err, url) {
        if (!err && url) {
            //need to delete cache
            redisClient.hdel(user, url.longUrl);
            redisClient.hdel(shortUrl, 'longUrl');
            redisClient.hdel(shortUrl, 'user');
            redisClient.hdel(shortUrl, 'createdTime');
            console.log("url is removed: " + url);
            callback({success: true});
        } else {
            callback({success: false});
        }
    });

    //delete from requestModel DB
    RequestModel.remove({shortUrl: shortUrl}, function (err) {
        if (err) throw err;
    })

};


module.exports = {
    getShortUrl: getShortUrl,
    getLongUrl: getLongUrl,
    getUrls: getUrls,
    deleteUrl: deleteUrl
};

