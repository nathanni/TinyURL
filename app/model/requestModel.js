var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//to-do shortUrl 这里可以使用int, only return decode url when return to users. save space
var requestSchema = new Schema({
    shortUrl: String,
    referer: String,
    platform: String,
    browser: String,
    country: String,
    timestamp: Date
});

var requestModel = mongoose.model('requestModel', requestSchema);
module.exports = requestModel;