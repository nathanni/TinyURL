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
    var shortUrl = urlService.getShortUrl(longUrl,
        req.app.longToShortHash, req.app.shortToLongHash); ////express puts app into req
    res.json({
        shortUrl: shortUrl,
        longUrl: longUrl
    });
});


module.exports = router;