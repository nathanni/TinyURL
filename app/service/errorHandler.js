//still need to execute callback whenever there is an error
var handleError = function (err, callback) {
    callback({success:false, msg: "Encountered Error!", err: err});
};

module.exports = {
    handleError: handleError
};