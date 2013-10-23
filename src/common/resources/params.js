(function(angular) {
    'use strict';

    angular.module('resources.params', ['services.connect', 'resources.rest'])

    .factory('Params', ['REST',
        function(REST) {
            var Params = new REST('param');
            return Params;
        }
    ]);

})(this.angular);
