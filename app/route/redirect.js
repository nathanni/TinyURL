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

router.get('*', function (req, res) {
    var orgUrl = req.originalUrl.slice(1); //similar to substring(1)

    emojiUrl.generateShortUrlFromEmoji(orgUrl, function (shortUrl) {
        getLongUrlandRedirect(shortUrl, req, res)
    });


});


var getLongUrlandRedirect = function (shortUrl, req, res) {
    urlService.getLongUrl(dummy, shortUrl, function (url) {
        if (url) {
            res.redirect(url.longUrl);
            statsService.logRequest(shortUrl, url.user, req);
        } else {
            res.sendFile(path.join(__dirname, '../frontend/view', '404.html'));
        }

    });
};

module.exports = router;