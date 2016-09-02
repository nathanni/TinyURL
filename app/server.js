/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var userAgent = require('express-useragent');

//import router
var apiRouter = require('./route/api');
var redirectRouter = require('./route/redirect');
var frontendRouter = require('./route/frontend');

//connect mLab
mongoose.connect('mongodb://scott:tiger@ds019756.mlab.com:19756/tinytinyurl');

//global map simulate database
// app.longToShortHash = {};
// app.shortToLongHash = {};

//static resource
app.use('/bower_components', express.static(__dirname + '/frontend/bower_components'));
app.use('/js', express.static(__dirname + '/frontend/js'));
app.use('/view', express.static(__dirname + '/frontend/view'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

//wrap useragent info into req
app.use(userAgent.express());

app.use('/api', apiRouter);

app.use('/', frontendRouter);

//:shortUrl as param, represents for 任意字符串匹配
app.use('/:shortUrl', redirectRouter);

app.listen(3000, function () {
    console.log("server start");
});

