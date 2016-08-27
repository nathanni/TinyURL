/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var app = express();

var apiRouter = require('./routes/api');
var redirectRouter = require('./routes/redirect');


app.use('/api', apiRouter);

//:shortUrl represents for 任意字符串匹配
app.use('/:shortUrl', redirectRouter);


app.listen(3000, function() {
   console.log("server start");
});

