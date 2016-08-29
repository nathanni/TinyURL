/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var app = express();

//import router
var apiRouter = require('./route/api');
var redirectRouter = require('./route/redirect');
var frontendRouter = require('./route/frontend');

//global map simulate database
app.longToShortHash = {};
app.shortToLongHash = {};


app.use('/api', apiRouter);

app.use('/', frontendRouter);

//static resource
app.use('/bower_components', express.static(__dirname + '/frontend/bower_components'));
app.use('/js', express.static(__dirname + '/frontend/js'));
app.use('/view', express.static(__dirname + '/frontend/view'));

//:shortUrl as param, represents for 任意字符串匹配
app.use('/:shortUrl', redirectRouter);


app.listen(3000, function () {
    console.log("server start");
});

