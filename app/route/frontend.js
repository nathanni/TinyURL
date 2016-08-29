/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var router = express.Router();
var path = require('path');


router.get('/', function (req, res) {
   res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
});


module.exports = router;