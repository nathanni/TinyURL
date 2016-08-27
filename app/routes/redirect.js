/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

router.get('*', function(req, res){
    var shorUrl = req.originalUrl.slice(1); //similar to substring(1)
    var longUrl = "";
    res.redirect(longUrl);
});