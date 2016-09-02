/**
 * Created by Nathan on 8/27/2016.
 */
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');
var jwt = require('jwt-simple');
var port = process.env.PORT || 3000;
var userAgent = require('express-useragent');

//import router
var apiRouter = require('./route/api');
var redirectRouter = require('./route/redirect');
var frontendRouter = require('./route/frontend');

//mongoDb
mongoose.connect(config.database);


//static resource
app.use('/bower_components', express.static(__dirname + '/frontend/bower_components'));
app.use('/js', express.static(__dirname + '/frontend/js'));
app.use('/view', express.static(__dirname + '/frontend/view'));
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// get our request parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); //return middleware that only parse json. A new body object containing the parse data on req.

// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize());

//wrap useragent info into req
app.use(userAgent.express());

//rest api router
app.use('/api', apiRouter);

//frontend router
app.use('/', frontendRouter);

//redirect router :shortUrl as param, represents for 任意字符串匹配
app.use('/:shortUrl', redirectRouter);


app.listen(port, function () {
    console.log("server starts on port: " + port);
});

