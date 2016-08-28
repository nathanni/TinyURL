/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

//import url servie
var urlService = require('../service/urlService');

router.get('*', function (req, res) {
    var shortUrl = req.originalUrl.slice(1); //similar to substring(1)
    var longUrl = urlService.getLongUrl(shortUrl, req.app.shortToLongHash);

    if (longUrl == undefined) {
        console.log("shortURL not found");
    }


    res.redirect(longUrl);
});

module.exports = router;