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
//docker 在创建实例的时候会传入这两个参数
var host = process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1';
var port = process.env.REDIS_PORT_6379_TCP_PORT || '6379';
var redisClient = redis.createClient(port, host);


//get or generate short url from long url
var getShortUrl = function (user, longUrl, validity, callback) {

    //to-do 不同协议的支持
    if (longUrl.indexOf('http') === -1) {
        longUrl = 'http://' + longUrl;
    }


    //read shortUrl info from DB, only when validity === -1
    var getShortUrlFromDB = function () {
        UrlModel.findOne({user: user, longUrl: longUrl, validity: -1}, function (err, url) {
            if (err) errorHandler.handleError(err, callback);
            else if (url) {
                redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                redisClient.hset(url.shortUrl, 'emojiUrl', url.emojiUrl);
                redisClient.hset(url.shortUrl, 'validity', url.validity);
                redisClient.hset(url.user, url.longUrl, url.shortUrl); //保证缓存里能通过user和longUrl找到的一定是-1的这一条
                redisClient.set(url.emojiUrl, url.shortUrl);
                callback(url);
            } else {
                generateShortUrl();
            }
        });
    };

    //generate shortUrl
    var generateShortUrl = function () {
        urlHash.generateShortUrl(longUrl, function (err, shortUrl, createdTime) {
            if (err) errorHandler.handleError(err, callback);
            emojiUrl.generateEmojiUrl(shortUrl, function (emojiUrl) {
                var url = new UrlModel({
                    user: user,
                    createdTime: new Date(createdTime),
                    longUrl: longUrl,
                    shortUrl: shortUrl,
                    emojiUrl: emojiUrl,
                    validity: validity
                });
                url.save(); // save to mongoDB
                callback(url);
            });

        });
    };



    //只有validity为-1的时候, 我们才需要从缓存或者从数据里读取, 在有自定义validity的情况,每次都要generate new shortUrl
    if (validity === -1) {
        redisClient.hget(user, longUrl, function (err, shortUrl) {
            //其实这里对缓存的调用可以优化, 只要查到shortUrl就能直接返回了, 这么做只是为了保证缓存的一致性, 如果缓存出错, 保证从数据库里面读取
            if (err) errorHandler.handleError(err, callback);
            else if (shortUrl) {
                redisClient.hmget(shortUrl, 'createdTime', 'emojiUrl', 'validity', function (err, data) {
                    if (err) errorHandler.handleError(err, callback);
                    else if (data.length == 3 && data[0] && data[1] && data[2]) {
                        console.log("byebye mongodb: getShortUrl");
                        callback({
                            user: user,
                            createdTime: data[0],
                            longUrl: longUrl,
                            shortUrl: shortUrl,
                            emojiUrl: data[1],
                            validity: parseInt(data[2])
                        });
                    } else {
                        getShortUrlFromDB();
                    }
                });
            } else {
                getShortUrlFromDB();
            }
        });
    } else {
        generateShortUrl();
    }


};


//get urlInfo from shortUrl
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
                callback({success:false});
            } else {
                var url = {
                    user: obj.user,
                    createdTime: obj.createdTime,
                    longUrl: obj.longUrl,
                    shortUrl: shortUrl,
                    emojiUrl: obj.emojiUrl,
                    validity: parseInt(obj.validity)
                };
                checkValidity(url);
            }
        } else {
            UrlModel.findOne({shortUrl: shortUrl}, function (err, url) {
                if (err) errorHandler.handleError(err, callback);
                else if (url) {
                    redisClient.hset(url.shortUrl, 'longUrl', url.longUrl);
                    redisClient.hset(url.shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
                    redisClient.hset(url.shortUrl, 'createdTime', url.createdTime);
                    redisClient.hset(url.shortUrl, 'emojiUrl', url.emojiUrl);
                    redisClient.hset(url.shortUrl, 'validity', url.validity);
                    redisClient.set(url.emojiUrl, url.shortUrl);
                    if (user != '______dummy$#%' && url.user != user && !(user != '______guest$#%' && url.user === '______guest$#%')) {
                        callback({success:false});
                    } else {
                        checkValidity(url);

                    }
                } else {
                    callback({success:false});
                }

            });
        }
    });

    var checkValidity = function (url) {

        if (url.validity === -1) {
            callback({success:true, url: url});
        } else {
            var currTime = new Date().getTime();
            var createdTime = new Date(url.createdTime).getTime();

            if (url.validity + createdTime < currTime) {
                console.log("shortUrl: " + url + "is expired.");
                callback({success:false, url: url});
            } else {
                callback({success:true, url: url});
            }
        }


    };



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
            redisClient.hdel(shortUrl, 'validity');
            redisClient.del(url.emojiUrl);
            console.log('url is removed: ' + url);
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


//update validity of shortUrl

var updateValidity = function (user, shortUrl,callback) {
    UrlModel.findOneAndUpdate({user: user, shortUrl: shortUrl}, {validity: -1}, function(err, url) {
        if (err) errorHandler.handleError(err, callback);
        if (url) {
            redisClient.hset(shortUrl, 'longUrl', url.longUrl);
            redisClient.hset(shortUrl, 'user', url.user); //记录shortURL belongs 哪个user
            redisClient.hset(shortUrl, 'createdTime', url.createdTime);
            redisClient.hset(shortUrl, 'emojiUrl', url.emojiUrl);
            redisClient.hset(shortUrl, 'validity', -1);
            redisClient.set(url.emojiUrl, url.shortUrl);
            console.log(shortUrl + ' - validity is updated to never expired');
            callback({success: true});
        } else {
            callback({success: false});
        }


    });

};



module.exports = {
    getShortUrl: getShortUrl,
    getLongUrl: getLongUrl,
    getUrls: getUrls,
    deleteUrl: deleteUrl,
    updateValidity: updateValidity
};

