/* global angular:true */

angular.module('help', ['ngRoute', 'resources.account'])

.config(['$routeProvider',
    function($routeProvider) {
        'use strict';
        $routeProvider.when('/help', {
            templateUrl: 'templates/help/help.tpl.html'
        });
    }
]);

