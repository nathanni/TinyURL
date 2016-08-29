/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json(); //return middleware that only parse json. A new body object containing the parse data on req.

//import url servie
var urlService = require('../service/urlService');


router.post('/urls', jsonParser, function (req, res) {
    var longUrl = req.body.longUrl; //longUrl is from JSON
    if (!longUrl || longUrl.trim() == '') {
        res.status(404).send("No shortUrl is generated");
    }
    var shortUrl = urlService.getShortUrl(longUrl,
        req.app.longToShortHash, req.app.shortToLongHash); ////express puts app into req
    res.json({
        shortUrl: shortUrl,
        longUrl: longUrl
    });
});

router.get('/urls/:shortUrl', function (req, res) {
    var shortUrl = req.params.shortUrl;
    var longUrl = urlService.getLongUrl(shortUrl, req.app.shortToLongHash);
    if (longUrl) {
        res.json({
            shortUrl: shortUrl,
            longUrl: longUrl
        });
    } else {
        res.status(404).send("what????");
    }
});

module.exports = router;