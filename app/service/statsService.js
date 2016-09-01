/**
 * Created by Nathan on 9/1/16.
 */
var logRequest = function (shortUrl, req) {
    var reqInfo = {};
    reqInfo.shortUrl = shortUrl;
    reqInfo.referer = req.headers.referer || 'Unknown';
    reqInfo.platform

};

module.exports = {
    logRequest: logRequest
};