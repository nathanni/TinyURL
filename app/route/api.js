/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

var passport = require('passport');
var config = require('../config/database'); // get secret
var jwt = require('jwt-simple'); //encode decode jwt

//import service
var urlService = require('../service/urlService');
var statsService = require('../service/statsService');
var userService = require('../service/userService');

const guest = '______guest$#%';
const dummy = '______dummy$#%';

//guest 生成shortUrl from long
router.post('/urls', function (req, res) {
    var longUrl = req.body.longUrl; //longUrl is from JSON
    if (!longUrl || longUrl.trim() == '') {
        res.status(400).send("No shortUrl is generated");
        return false;
    }
    //数据库读写是IO操作, 得改用callback
    urlService.getShortUrl(guest, longUrl, function (url) {
        res.json(url);
    });
});
//user 生成shortUrl from long
router.post('/user/urls', passport.authenticate('jwt', {session: false}), function (req, res) {
    var user = req.body.user;
    var longUrl = req.body.longUrl;
    if (!longUrl || longUrl.trim() == '') {
        res.status(400).send("No shortUrl is generated");
        return false;
    }
    urlService.getShortUrl(user, longUrl, function (url) {
        res.json(url);
    });
});


//user get all urls info
router.get('/user/urls',passport.authenticate('jwt', {session: false}), function (req, res) {

    var user = getUser(req);

    urlService.getUrls(user, function (urls) {
        res.json(urls);
    })
});

//user delete url info, guest has no permission to do this
router.delete('/user/urls/:shortUrl', passport.authenticate('jwt', {session: false}), function (req, res) {
    var user = getUser(req);
    var shortUrl = req.params.shortUrl;
    urlService.deleteUrl(user, shortUrl, function () {

    })
});






//guest 获得longUrl from short
router.get('/urls/:shortUrl', function (req, res) {
    var shortUrl = req.params.shortUrl;
    urlService.getLongUrl(guest, shortUrl, function (url) {
        if (url) {
            res.json(url);
        } else {
            res.status(404).send("no permission");
        }
    });
});
//user 获得longUrl from short
router.get('/user/urls/:shortUrl', passport.authenticate('jwt', {session: false}), function (req, res) {
    var shortUrl = req.params.shortUrl;

    var user = getUser(req);

    urlService.getLongUrl(user, shortUrl, function (url) {
        if (url) {
            res.json(url);
        } else {
            res.status(404).send("no permission");
        }
    });
});




//guest 获得shortUrl stats
router.get('/urls/:shortUrl/:info', function (req, res) {
    statsService.getUrlInfo(req.params.shortUrl, req.params.info,function (data) {
        res.json(data);
    });
});
//user 获得shortUrl stats
router.get('/user/urls/:shortUrl/:info', passport.authenticate('jwt', {session: false}), function (req, res) {
    statsService.getUrlInfo(req.params.shortUrl, req.params.info, function (data) {
        res.json(data);
    });
});


// function to get token from request.header
var getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

//get user from token in request.headers.Authorization
var getUser = function(req) {
    var token = getToken(req.headers);
    if (token) {
        var user = jwt.decode(token, config.secret).username;
    } else {
        var user = dummy;
    }
    return user;
};





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
    userService.userdash(req.headers, function (statusCode, ret) {
        res.status(statusCode).json(ret);
    });
});


module.exports = router;