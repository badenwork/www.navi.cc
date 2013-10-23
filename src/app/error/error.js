/* global angular:true */

angular.module('error', ['ngRoute'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/error', {
            templateUrl: 'templates/error/error.tpl.html',
            controller: 'ErrorCtrl'
        });

        $routeProvider.otherwise({
            redirectTo: '/error'
        });

    }
])

.controller('ErrorCtrl', ['$scope',
    function($scope) {
        'use strict';
        var manifest = document.querySelector('html').manifest;
        $scope.appcache = btoa(manifest);
    }
]);
