/**
 * Created by Nathan on 9/11/2016.
 */
var cacheConfig = require('../config/cache');
var redis = require('redis');

//redis as publish-subscribe module
var redisHost = process.env.REDIS_PORT_6379_TCP_ADDR || cacheConfig.redisHost;
var redisPort = process.env.REDIS_PORT_6379_TCP_ADDR || cacheConfig.redisPost;
var redisClient = redis.createClient(redisPort, redisHost);


//action: api, maxReq: max request number, period: max request period, req: httpRequest, restricAccess: callback for restrict access
var rateLimiter = function (action, maxReq, period, req, restricAccess, callback) {
    var multi = redisClient.multi();
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    var keyname = action + ':' +ip;
    redisClient.llen(keyname, function (err, data) {
        if (err) callback();
        if (data && data >= maxReq) {
            restricAccess();
        } else {
            redisClient.exists(keyname, function (err, data) {
                if (err) throw err;
                if (data) {
                    multi.rpushx(keyname, keyname);
                } else {
                    multi.rpush(keyname, keyname);
                    multi.expire(keyname, period);
                }
                multi.exec(function (err, data) {
                    callback();
                })
            });

        }
    })
};

module.exports = rateLimiter;