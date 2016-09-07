/**
 * Created by Nathan on 9/6/2016.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//专门的数据库表来记录sequential ID, 全局共享
var sequenceSchema = new Schema({
    name: String,
    sequentialId: Number
});

var SequenceModel = mongoose.model('SequenceModel', sequenceSchema);
module.exports = SequenceModel;