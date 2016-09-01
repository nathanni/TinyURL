/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json(); //return middleware that only parse json. A new body object containing the parse data on req.

//import url service
var urlService = require('../service/urlService');


router.post('/urls', jsonParser, function (req, res) {
    var longUrl = req.body.longUrl; //longUrl is from JSON
    if (!longUrl || longUrl.trim() == '') {
        res.status(404).send("No shortUrl is generated");
        return;
    }
    //数据库读写是IO操作, 得改用callback
    urlService.getShortUrl(longUrl, function (url) {
        res.json(url);
    });
});

router.get('/urls/:shortUrl', function (req, res) {
    var shortUrl = req.params.shortUrl;
    urlService.getLongUrl(shortUrl, function (url) {
        if (url) {
            res.json(url);
        } else {
            res.status(404).send("what????");
        }
    });
});

module.exports = router;