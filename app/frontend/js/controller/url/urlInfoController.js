/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('urlInfoController', ['$scope', 'fromUser', '$http', '$location', '$stateParams',
    function ($scope,fromUser, $http, $location, $stateParams) {



        if (fromUser) {
            var api = '/api/user/urls/';

        } else {
            var api = '/api/urls/';
        }

        $scope.dateFormat = 'MMM d, yyyy hh:mm:ss a';

        $http.get(api + $stateParams.shortUrl)
            .success(function (data) {
                $scope.shortUrl = data.shortUrl;
                $scope.longUrl = data.longUrl;
                $scope.createdTime = new Date(data.createdTime);
                //这里不能定义$scope.user, 不然会读取到$rootScope.user
                $scope.createdByuser = data.user === '______guest$#%' ? 'public' : data.user; // hide real guest's name
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
        };

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