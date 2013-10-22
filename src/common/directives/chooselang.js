angular.module('directives.language', ['i18n'])

.directive('chooselang', ['$translate', 'i18n', function($translate, i18n) {
    return {
        restrict: 'E',
        replace: true,
        template: '<div class="btn-group"><button type="button" class="btn btn-primary" ng-class="{active: l.code == active}" ng-repeat="l in langs" title="{{ l.title }}" ng-click="onSet(l)">{{ l.text }}</button></div>',
        link: function(scope, element, attrs) {
            scope.langs = i18n.langs;
            scope.active = i18n.active();
            scope.onSet = function(lang){
                scope.active = lang.code;
                i18n.lang(lang.code);
            };

        }
    };
}]);
