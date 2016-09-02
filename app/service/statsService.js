/**
 * Created by Nathan on 9/1/16.
 */
var geoip = require('geoip-lite');
var requestModel = require('../model/requestModel');

var logRequest = function (shortUrl, req) {
    var reqInfo = {};
    reqInfo.shortUrl = shortUrl;
    reqInfo.referer = req.headers.referer || 'Unknown';
    reqInfo.platform = req.useragent.platform || 'Unknown';
    reqInfo.browser = req.useragent.browser || 'Unknown';
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;

    var geo = geoip.lookup(ip);

    if (geo) {
        reqInfo.country = geo.country;
    } else {
        reqInfo.country = 'Unknown';
    }

    reqInfo.timestamp = new Date();
    console.log(reqInfo.timestamp);

    var request = new requestModel(reqInfo);
    request.save();

};

var getUrlInfo = function (shortUrl, info, callback) {
    if (info === 'totalClicks') {
        requestModel.count({shortUrl: shortUrl}, function (err, data) {
            callback(data);
        });
        return;
    }
    var groupId = '';

    if (info === 'hour') {
        groupId = {
            year: {$year: '$timestamp'},
            month: {$month: '$timestamp'},
            day: {$dayOfMonth: '$timestamp'},
            hour: {$hour: '$timestamp'},
            minute: {$minute: '$timestamp'}
        }
    } else if (info === 'day') {
        groupId = {
            year: {$year: '$timestamp'},
            month: {$month: '$timestamp'},
            day: {$dayOfMonth: '$timestamp'},
            hour: {$hour: '$timestamp'},
        }
    } else if (info === 'month') {
        groupId = {
            year: {$year: '$timestamp'},
            month: {$month: '$timestamp'},
            day: {$dayOfMonth: '$timestamp'},

        }
    } else {
        groupId = '$' + info;
    }


    requestModel.aggregate([
        {
            $match: {
                shortUrl: shortUrl
            }
        },
        {
            $sort: {
                timestamp: -1
            }
        },
        {
            $group: {
                _id: groupId,
                count: {
                    $sum: 1
                }
            }
        }
    ], function (err, data) {
        callback(data);
    });
};


module.exports = {
    logRequest: logRequest,
    getUrlInfo: getUrlInfo
};