/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var app = express();

//import router
var apiRouter = require('./route/api');
var redirectRouter = require('./route/redirect');

//global map simulate database
app.longToShortHash = {};
app.shortToLongHash = {};


app.use('/api', apiRouter);
//:shortUrl represents for 任意字符串匹配
app.use('/:shortUrl', redirectRouter);


app.listen(3000, function () {
    console.log("server start");
});

