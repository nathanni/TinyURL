var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
var UserModel = require('../model/userModel');
var config = require('../config/database'); // get db config file

module.exports = function (passport) {
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = config.secret;
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {

        //如果token被篡改, 即 part 1 + part2 不能hash出part3, 直接返回false, 底下的代码都不会执行
        UserModel.findOne({username: jwt_payload.username}, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user && user.password === jwt_payload.password) {
                done(null, true);
            } else {
                done(null, false);
            }
        });
    }));
};