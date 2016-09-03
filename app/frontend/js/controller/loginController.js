/**
 * Created by Nathan on 9/3/2016.
 */
angular.module('tinyUrl').controller('loginController', ['$uibModalInstance',  function ($uibModalInstance) {
    var $ctrl = this;

    $ctrl.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}]);
