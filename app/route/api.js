/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

var passport = require('passport');

//import service
var urlService = require('../service/urlService');
var statsService = require('../service/statsService');
var userService = require('../service/userService');

router.post('/urls', function (req, res) {
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

router.get('/urls/:shortUrl/:info', function (req, res) {
    statsService.getUrlInfo(req.params.shortUrl, req.params.info, function (data) {
        res.json(data);
    });
});



//authentication
//signup
router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please enter username and password.'});
    } else {
        userService.signup(req.body.username, req.body.password, function (ret) {
            res.json(ret);
        });
    }
});

//login
router.post('/login', function (req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please enter username and password.'});
    } else {
        userService.signin(req.body.username, req.body.password, function (ret) {
            res.json(ret);
        });
    }
});

//get userdash info, protected by passport
router.get('/userdash', passport.authenticate('jwt', {session: false}), function (req, res) {
    userService.userdash(req.headers, function(statusCode, ret) {
        res.status(statusCode).json(ret);
    });
});



module.exports = router;