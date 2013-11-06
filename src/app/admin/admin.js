/* global angular:true */

angular.module('admin', ['ngRoute', 'admin.systems'])

.factory('AdminUsers', [
    'SERVER', '$http', '$q',
    function(SERVER, $http, $q) {
        'use strict';

        var _get = function() {
            var defer = $q.defer();

            $http({
                method: 'GET',
                url: SERVER.api + '/admin/users'
            }).success(function(data) {
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
        'use strict';

        $routeProvider.when('/admin', {
            templateUrl: 'templates/admin/admin.tpl.html',
            controller: 'AdminViewCtrl',
            resolve: {
                users: ['AdminUsers',
                    function(AdminUsers) {
                        return AdminUsers;
                    }
                ]
            }
        });
    }
])

.controller('AdminViewCtrl', ['$scope', 'users',
    function($scope, users) {
        'use strict';
        $scope.users = users;
    }
]);
