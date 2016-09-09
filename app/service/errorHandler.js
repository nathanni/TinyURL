//still need to execute callback whenever there is an error
var handleError = function (err, callback) {
    callback({msg: "Encounted Error!", err: err});
};

module.exports = {
    handleError: handleError
};