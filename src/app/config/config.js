angular.module('config', ['ngRoute','resources.account', 'resources.system', 'ui.sortable', 'config.system.params', 'directives.lists'])

.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/config', {
        templateUrl:'templates/config/config.tpl.html',
        controller:'ConfigViewCtrl',
        resolve:{
            account:['Account', function (Account) {
                return Account.get();
            }],
            systems: ['System', function (System) {
                return System.getall();
            }]
        }
    });
}])

.controller('ConfigViewCtrl', ['$scope', '$location', 'account', 'systems', 'System', function ($scope, $location, account, systems, System) {

    $scope.account = account;
    $scope.systems = systems;

    $scope.deleteenable = false;

    $scope.onFromFiles = function(){
        account.systemadd($scope.files);
        $scope.addform = false;
    };

    $scope.onoff = function(el){
        var off = $scope.account.account.off;
        if(off.hasOwnProperty(el)) {
            var s = systems[el];
            s.hide = false;
            delete off[el];
        } else {
            var s = systems[el];
            s.hide = true;
            off[el] = true;
        }
        account.$patch('off');
    };

    $scope.sortableOptions = {
        handle: ".msp",
        revert: true,
        scrollSpeed: 5,
        cursor: 'crosshair',
        placeholder: 'ui-sortable-placeholder2',
        axis: 'y',
        stop: function(e, ui) {
            account.$patch('skeys');
        }
    };

    $scope.del = function(el){
        account.systemdel(el);
    };
}]);
