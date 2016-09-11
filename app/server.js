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
var port = process.env.PORT || 3000;
var userAgent = require('express-useragent');
var redis = require('redis');

//redis as publish-subscribe module
var redisHost = process.env.REDIS_PORT_6379_TCP_ADDR || '127.0.0.1';
var redisPort = process.env.REDIS_PORT_6379_TCP_PORT || '6379';
var redisClient = redis.createClient(redisPort, redisHost);


// Use the passport package in our application
app.use(passport.initialize());

//apply passport strategy
require('./config/passport')(passport);

//mongoDb
mongoose.connect(config.database);

var server = app.listen(port, function () {
    console.log("server starts on port: " + port);
});

var io = require('socket.io')(server);

io.on('connection', function (socket) {
    socket.on('statsPageOpen', function (data) {
        redisClient.subscribe(data.shortUrl, function () {
            socket.shortUrl = data.shortUrl;
            console.log('subscribe channel: ' + data.shortUrl);
        });
        redisClient.on('message', function (err, msg) {
            if (msg === socket.shortUrl) {
                socket.emit('reload', 'please reload stats');
            }
        });
        // app.io[data.shortUrl] = socket;//为了在redirect里面调用app.io的时候可以调用到具体是哪个socket,然后进行通信
        // socket.shortUrl = data.shortUrl;//为了在disconnect的时候通过找shortUrl把app.io里面对该socket的映射删除
    });
    socket.on('disconnect', function () {
        // delete app.io[socket.shortUrl];//删除socket映射
        redisClient.unsubscribe(socket.shortUrl, function () {
            console.log('Unsubsribe channel:' + socket.shortUrl);
        });

    })
});


//import router
var apiRouter = require('./route/api');
var redirectRouter = require('./route/redirect');
var frontendRouter = require('./route/frontend');

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

//wrap useragent info into req
app.use(userAgent.express());

//rest api router
app.use('/api', apiRouter);

//frontend router
app.use('/', frontendRouter);

//redirect router :shortUrl as param, represents for 任意字符串匹配
app.use('/:shortUrl', redirectRouter);



