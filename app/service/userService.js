var config = require('../config/database'); // get secret
var jwt = require('jwt-simple'); //encode decode jwt

var UserModel = require('../model/userModel');
var errorHandler = require('./errorHandler');



var signup = function (username, password, callback) {
    var newUser = new UserModel({
        username: username,
        password: password
    });

    //调用userModel里面的save方法, 对密码进行hash
    newUser.save(function(err) {
        var msg = {};
        if (err) {
            msg = {success: false, msg: 'Username already exists.'};
        } else {
            msg = {success: true, msg: 'Successful created new user.'}
        }
        callback(msg);
    });
};

var signin = function(username, password, callback) {
    UserModel.findOne( {
       username: username
    }, function (err, user) {
        if (err) errorHandler.handleError(err, callback);

        if (!user) {
            callback({success: false, msg: 'Authentication failed. User not found.'});
        } else {
            //调用compare方法, 比较用户输入密码的hash是否和数据库里面存的相等
            user.comparePassword(password, function (err, isMatch) {
                if (err) errorHandler.handleError(err, callback);
                else if (isMatch) {
                    var token = jwt.encode(user, config.secret);
                    callback({success: true, token: 'JWT ' + token});
                } else {
                    callback({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
};

var userdash = function (headers, callback) {
    var token = getToken(headers);
    if (token) {
        //get user
        var decoded = jwt.decode(token, config.secret);
        UserModel.findOne({
            username: decoded.username
        }, function (err, user) {
            if (err) errorHandler.handleError(err, callback);

            else if (!user) {
                callback(403, {success: false, msg: 'Authentication failed. User not found'});
            } else {
                callback(200, {success: true, msg: 'Authentication validated successfully!', user: user});
            }
        });
    } else {
        callback(403, {success: false, msg: 'Authentication failed. No token provided'});
    }
};

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



module.exports = {
    signup: signup,
    signin: signin,
    userdash: userdash
};