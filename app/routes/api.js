/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();

router.post('/urls', jsonParser, function(req, res){
    var longUrl = req.body.longUrl; //longUrl is from JSON
});


module.exports = router;