/* global angular:true */

angular.module('resources.params', ['services.connect', 'resources.rest'])

.factory('Params', ['REST',
    function(REST) {
        'use strict';

        var Params = new REST('param');
        return Params;
    }
]);

