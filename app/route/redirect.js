/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

//import service
var urlService = require('../service/urlService');
var statsService = require('../service/statsService');
var emojiUrl = require('../emoji/emojiUrl');

const dummy = '______dummy$#%';


var getRedirectRouter = function (redis, redisHost, redisPort) {

    var redisClient = redis.createClient(redisPort, redisHost);

    router.get('*', function (req, res) {
        var getLongUrlandRedirect = function (shortUrl) {
            urlService.getLongUrl(dummy, shortUrl, function (data) {
                if (data.success && data.url) {
                    res.redirect(data.url.longUrl);
                    statsService.logRequest(shortUrl, data.url.user, req);

                    // //只通知connect的相应的socket reload
                    // if(app.io[shortUrl]) {
                    //     app.io[shortUrl].emit('reload', 'please reload stats');
                    // }
                    redisClient.publish(shortUrl, shortUrl);

                } else {
                    res.sendFile(path.join(__dirname, '../frontend/view', '404.html'));
                }

            });
        };


        var orgUrl = req.originalUrl.slice(1); //similar to substring(1)

        if (orgUrl.startsWith('%')) {
            emojiUrl.generateShortUrlFromEmoji(orgUrl, function (shortUrl) {
                getLongUrlandRedirect(shortUrl)
            });
        } else {
            getLongUrlandRedirect(orgUrl);
        }

    });

    return router;
};




module.exports = getRedirectRouter;