angular.module('help', ['ngRoute', 'resources.account'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/help', {
        templateUrl:'templates/help/help.tpl.html'
        // controller:'HelpViewCtrl'
    });
}]);

// .controller('HelpViewCtrl', [function () {
// }]);
