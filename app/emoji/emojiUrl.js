/**
 * Created by Nathan on 9/7/16.
 */

var dictionary = require('./dictionary');
var emojione = require('../node_modules/emojione/lib/js/emojione.js');

var generateEmojiUrl = function (shortUrl, callback) {

    var emojiUrl = '';
    for (var i = 0; i < shortUrl.length; i++) {
        emojiUrl += dictionary.codeToEmoji[shortUrl[i]];
    }
    var prefix = '';
    var suffix = '';

    //随机组装prefix and suffix
    for(var i = 0; i < 3; i++) {
        var randomPrefix = Math.floor((Math.random() * dictionary.prefix.length));
        var randomSuffix = Math.floor((Math.random() * dictionary.suffix.length));
        prefix += dictionary.prefix[randomPrefix];
        suffix += dictionary.suffix[randomSuffix];
    }


    emojiUrl = prefix + '.' + emojiUrl + '.' + suffix;
    callback(emojiUrl);

};


var generateShortUrlFromEmoji = function (orgUrl, callback) {


    try {
        orgUrl = decodeURIComponent(orgUrl);
    } catch (e) {
        callback();
    }


    var split = orgUrl.split(/([\uD800-\uDBFF][\uDC00-\uDFFF])/);

    if (split.length < 2) {
        callback(orgUrl);
    } else {


        var arr = [];
        for (var i = 0; i < split.length; i++) {
            var char = split[i];
            if (char !== "") {
                arr.push(char);
            }
        }

        var shortUrl = '';

        for (var i = 0; i < arr.length; i++) {
            var shortName = emojione.toShort(arr[i]);
            if (dictionary.emojiToCode[shortName]) {
                shortUrl += dictionary.emojiToCode[shortName];
            }
        }

        callback(shortUrl);
    }


};


module.exports = {
    generateEmojiUrl: generateEmojiUrl,
    generateShortUrlFromEmoji: generateShortUrlFromEmoji
};