/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('urlInfoController', ['$scope', '$http', '$location', '$stateParams',
    function ($scope, $http, $location, $stateParams) {

        if ($stateParams.user) {
            var api = '/api/user/urls/';

        } else {
            var api = '/api/urls/';
        }

        $http.get(api + $stateParams.shortUrl)
            .success(function (data) {
                $scope.shortUrl = data.shortUrl;
                $scope.longUrl = data.longUrl;
                $scope.shortUrlToShow = $location.protocol() + "://" +
                    $location.host() + ":" +
                    $location.port() + "/" +
                    $scope.shortUrl;
            });


        $http.get(api + $stateParams.shortUrl + "/totalClicks")
            .success(function (data) {
                $scope.totalClicks = data;
            });

        var renderChart = function (chart, infos) {
            $scope[chart + 'Labels'] = [];
            $scope[chart + 'Data'] = [];

            $http.get(api + $stateParams.shortUrl + "/" + infos)
                .success(function (data) {
                    data.forEach(function (info) {
                        $scope[chart + 'Labels'].push(info._id);
                        $scope[chart + 'Data'].push(info.count);
                    });
                });
        };

        renderChart('pie', 'referer');
        renderChart('doughnut', 'country');
        renderChart('bar', 'platform');
        renderChart('base', 'browser');

        $scope.getTime = function (time) {
            $scope.lineLabels = [];
            $scope.lineData = [];
            $scope.time = time;
            $http.get(api + $stateParams.shortUrl + '/' + time)
                .success(function (data) {
                    data.forEach(function (info) {

                        var cordinate = '';
                        if (time === 'hour') {
                            if (info._id.minute < 10) {
                                info._id.minute = '0' + info._id.minute;
                            }
                            cordinate = info._id.hour + ':' + info._id.minute;
                        }

                        if (time === 'day') {
                            cordinate = info._id.hour + ':00';
                        }

                        if (time === 'month') {
                            cordinate = info._id.month + '/' + info._id.day;
                        }

                        $scope['lineLabels'].push(cordinate);
                        $scope['lineData'].push(info.count);
                    });
                });
        }

        $scope.getTime('hour');
    }])

    .factory('AuthInterceptor', function ($rootScope, $q, PERMISSION_EVENTS) {
        return {
            responseError: function (response) {
                $rootScope.$broadcast({
                    404: PERMISSION_EVENTS.noPermission
                }[response.status], response);
                return $q.reject(response);
            }
        };
    })

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    });