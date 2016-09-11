var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//to-do shortUrl 这里可以使用int, only return decode url when return to users. save space
var urlSchema = new Schema({
    user: String,
    createdTime: Date,
    longUrl: String,
    shortUrl: String,
    emojiUrl: String,
    validity: Number
});

var UrlModel = mongoose.model('UrlModel', urlSchema);
module.exports = UrlModel;