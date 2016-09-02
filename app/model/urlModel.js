var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//to-do shortUrl 这里可以使用int, only return decode url when return to users. save space
var urlSchema = new Schema({
    longUrl: String,
    shortUrl: String
});

var UrlModel = mongoose.model('UrlModel', urlSchema);
module.exports = UrlModel;