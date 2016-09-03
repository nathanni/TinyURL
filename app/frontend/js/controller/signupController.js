/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('signupController', ['$uibModalInstance',  function ($uibModalInstance) {
    var $ctrl = this;

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);