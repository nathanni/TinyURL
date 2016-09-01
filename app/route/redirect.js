/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();
var path = require('path');

//import url service
var urlService = require('../service/urlService');
var statsService = require('../service/statsService');

router.get('*', function (req, res) {
    var shortUrl = req.originalUrl.slice(1); //similar to substring(1)
    urlService.getLongUrl(shortUrl, function (url) {
        if (url) {
            res.redirect(url.longUrl);
            statsService.logRequest(shortUrl, req);
        } else {
            res.sendFile(path.join(__dirname, '../frontend/view', '404.html'));
        }

    });

});

module.exports = router;