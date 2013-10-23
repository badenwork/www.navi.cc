(function(angular, console) {
    'use strict';

    angular.module('admin', ['ngRoute'])

    .factory('AdminUsers', [
        'SERVER', '$http', '$q',
        function(SERVER, $http, $q) {

            var _get = function() {
                var defer = $q.defer();

                $http({
                    method: 'GET',
                    url: SERVER.api + '/admin/users'
                }).success(function(data) {
                    console.log('admin/users:get.success', data);
                    defer.resolve(data);
                });

                return defer.promise;
            };

            var Users = {
                get: _get
            };
            return Users;
        }
    ])

    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/admin', {
                templateUrl: 'templates/admin/admin.tpl.html',
                controller: 'AdminViewCtrl',
                resolve: {
                    users: ['AdminUsers',
                        function(AdminUsers) {
                            console.log('AdminUsers', AdminUsers);
                            return AdminUsers;
                        }
                    ]
                }
            });
        }
    ])

    .controller('AdminViewCtrl', ['$scope', '$location', 'users',
        function($scope, $location, users) {
            var all = users.get();

            $scope.formAddUser = false;
            $scope.users = [{
                username: 'baden',
                title: 'Да, это я',
                groups: []
            }];

            console.log('AdminViewCtrl:', users, all);

            $scope.user = {};

            $scope.addUser = function() {
                $scope.users.push($scope.user);
                $scope.user = {};
                $scope.formAddUser = false;
            };
        }
    ]);

})(this.angular, this.console);
