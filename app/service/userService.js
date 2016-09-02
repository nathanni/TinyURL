// pass passport for configuration
var passport = require('passport');
require('../config/passport')(passport);

var UserModel = require('../model/userModel');


var signup = function (username, password, callback) {
    var newUser = new UserModel({
        username: username,
        password: password
    });

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

module.exports = {
    signup: signup
};