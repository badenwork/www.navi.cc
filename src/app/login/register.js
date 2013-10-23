/* global angular:true, $:true */

angular.module('register', ['ngRoute', 'i18n', 'ui.bootstrap.buttons', 'resources.account', 'ngAnimate', 'directives.lists'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/register', {
            templateUrl: 'templates/login/register.tpl.html',
            controller: 'RegisterViewCtrl'
        });
    }
])

.controller('RegisterViewCtrl', ['$scope', '$location', 'Account', '$timeout',
    function($scope, $location, Account, $timeout) {
        'use strict';

        $scope.user = {
            newgroup: true
        };

        $scope.showRealName = false;
        $scope.showEmail = false;
        $scope.showGroup = false;

        $scope.groupCmd = 'Не создавать группу';

        $scope.registerUser = function() {
            $scope.error = false;
            $scope.showerror = false;
            var credentials = {
                username: $scope.user.username,
                password: $scope.user.password
            };

            if ($scope.showRealName) {
                credentials.title = $scope.user.title;
            }

            if ($scope.showEmail) {
                credentials.email = $scope.user.email;
            }

            if ($scope.showGroup) {
                credentials.newgroup = $scope.user.newgroup;
                credentials.groupname = $scope.user.groupname;
                credentials.grouppassword = $scope.user.grouppassword;
            }

            Account.register(credentials).then(function() {
                $('#registerMessage').modal();
            }, function(result) {
                $scope.error = result;
                $scope.showerror = true;
                $timeout(function() {
                    $scope.showerror = false;
                }, 3000);
            });
        };

        $timeout(function() {
            $('#bugfix0001').removeAttr('style');
        }, 2000);
    }
]);
