angular.module('directives.language', ['i18n'])

.directive('chooselang', ['$translate', function($translate) {
    return {
        restrict: 'E',
        replace: true,
        // template: '<div class="btn-group" data-toggle="buttons-radio"><button type="button" class="btn" ng-class="{active: l.code == active}" ng-repeat="l in langs" title="{{ l.title }}" ng-click="onSet(l)">{{ l.text }}</button></div>',
        template: '<div class="btn-group"><button type="button" class="btn btn-primary" ng-class="{active: l.code == active}" ng-repeat="l in langs" title="{{ l.title }}" ng-click="onSet(l)">{{ l.text }}</button></div>',
        // template:   '<select ng-model="lang">'+
        //             '<option value="">Выберите язык</option>'+
        //             '<option ng-repeat="l in langs" value="{{l.lang}}">{{l.title}}</option>'+
        //             '</select>',
                    // '{{ lang }}'
        link: function(scope, element, attrs) {
            console.log('chooselang.link');
            scope.langs = [
                {code: 'ru_RU', text: 'RU', title: "Русский"},
                {code: 'en_EN', text: 'EN', title: "English"},
                {code: 'ua_UA', text: 'UA', title: "Українська"},
                {code: 'pl_PL', text: 'PL', title: "Polski"}
            ];
            // scope.active = i18n.active;
            // scope.onSet = function(l){
            //     i18n.set(l.code);
            //     location.reload();
            // };
            // console.log('language directive: link', scope, element, i18n);
            // $scope.lang = "en_EN";
            scope.active = $translate.uses();
            // scope.lang = $translate.uses();
            // scope.$watch("lang", function(lang){
            //     // $log.warn("lang=", lang);
            //     $translate.uses(lang);
            //     localStorage.setItem('language', lang);
            // });
            scope.onSet = function(lang){
                console.log("lang=", lang);
                scope.active = lang.code;
                $translate.uses(lang.code);
                localStorage.setItem('language', lang.code);
            };

        }
        //, controller: ["account", function(account){console.log("account=", account)}]
    };
}]);

