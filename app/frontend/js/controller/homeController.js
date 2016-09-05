/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('homeController', ['$scope', '$uibModal', 'REQUIRE_RELOGIN', '$location',
    function ($scope, $uibModal, REQUIRE_RELOGIN, $location) {
        $scope.navView = 'nav';
        $scope.mainView = 'main';

        var $ctrl = this;

        $ctrl.animationsEnabled = true;

        $ctrl.openSignup = function (size) {
            var signupInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/view/authentication/signup.html',
                controller: 'signupController',
                controllerAs: '$ctrl',
                size: size,
                resolve: {}
            });

        };

        $ctrl.openLoginOrg = function (size, resolve) {
            var loginInstance = $uibModal.open({
                animation: $ctrl.animationsEnabled,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                templateUrl: '/view/authentication/login.html',
                controller: 'loginController',
                controllerAs: '$ctrl',
                scope: $scope,
                size: size,
                resolve: resolve
            });


        };


        $ctrl.openLogin = function () {
            $ctrl.openLoginOrg('md', {
                reLoginAlert: function () {
                    return undefined;
                }
            });
        };

        //open login with session lost alert
        $scope.$on(REQUIRE_RELOGIN.sessionInvalid, function (event) {
            $ctrl.openLoginOrg('md', {
                reLoginAlert: function () {
                    return 'Session Lost...... Sorry, You have to login again.';
                }
            });
        });

        $scope.isActive = function (viewLocation) {

            if ($location.path().startsWith('/urlInfo')) {
                return viewLocation === '/urlInfo';
            } else if  ($location.path().startsWith('/user/urlInfo')) {
                return viewLocation === '/user/urlInfo';
            }
            else {
                return viewLocation === $location.path();
            }
        };

    }]);



