/**
 * Created by Nathan on 8/28/2016.
 */
angular.module('tinyUrl').controller('urlInfoController', ['$window', '$state', '$scope', 'fromUser', '$http', '$location', '$stateParams',
    function ($window, $state, $scope, fromUser, $http, $location, $stateParams) {

        //空的shortUrl传入直接redirect回home
        if (!$stateParams.shortUrl) {
                $state.go('home');
        } else {
            var socket = io();

            socket.emit('statsPageOpen', {shortUrl: $stateParams.shortUrl});

            socket.on('reload', function () {
                loadStats();
            });


            if (fromUser) {
                var api = '/api/users/urls/';

            } else {
                var api = '/api/urls/';
            }

            $scope.dateFormat = 'MMM d, yyyy hh:mm:ss a';

            $scope.urlPrefix = $location.protocol() + '://' + $location.host();
            if ($location.port() != '80') {
                $scope.urlPrefix += ':' + $location.port();
            }
            $scope.urlPrefix += '/';


            $http.get(api + $stateParams.shortUrl)
                .success(function (data) {
                    $scope.shortUrl = data.shortUrl;
                    $scope.emojiUrl = data.emojiUrl;
                    emojione.imageType = 'png';
                    $scope.emojiUrlToShow = emojione.shortnameToImage($scope.emojiUrl);//emojiOne
                    $scope.longUrl = data.longUrl;
                    $scope.createdTime = new Date(data.createdTime);

                    $scope.expirationTime = 'FOREVER';
                    if (data.validity != -1) {
                        $scope.expirationTime = new Date($scope.createdTime.getTime() + data.validity);
                        if ($scope.expirationTime < new Date()) {
                            $scope.expirationTime = 'EXPIRED';
                        }

                    }
                    //这里不能定义$scope.user, 不然会读取到$rootScope.user
                    $scope.createdByUser = data.user === '______guest$#%' ? 'public' : data.user; // hide real guest's name
                    $scope.showRenewButton = $scope.expirationTime != 'FOREVER' && data.user != '______guest$#%' && fromUser; //true when the login user have the right permission to the shortURL

                    $scope.shortUrlToShow = $scope.urlPrefix + $scope.shortUrl;
                    $scope.emojiUrlToShowSmall = emojione.shortnameToUnicode($scope.emojiUrl);
                    $scope.emojiUrlToClick = $scope.urlPrefix + $scope.emojiUrlToShowSmall;


                    //update validity
                    $scope.updateValidity = function () {
                        var updateValidity = $window.confirm('Make this shortURL never expired?');
                        if (updateValidity) {
                            $http.put(api + $stateParams.shortUrl, {}).success(function (data) {
                                if (data.success) {
                                    console.log('update validity success');
                                    $scope.expirationTime = 'FOREVER';
                                    $scope.showRenewButton = false;
                                } else {
                                    console.log('update validity fail');
                                    $window.alert('Error happened, contact the administrator.');
                                }
                            });
                        }
                    }


                });


            var getTotalClicks = function () {
                $http.get(api + $stateParams.shortUrl + "/totalClicks")
                    .success(function (data) {
                        $scope.totalClicks = data;
                    });
            };


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


            var loadStats = function () {
                getTotalClicks();
                renderChart('pie', 'referer');
                renderChart('doughnut', 'country');
                renderChart('bar', 'platform');
                renderChart('base', 'browser');
                $scope.getTime('hour');
            };

            loadStats();
        }


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