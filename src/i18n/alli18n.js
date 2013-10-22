
angular.module('i18n', ['pascalprecht.translate', 'i18n.ru', 'i18n.en', 'i18n.pl', 'i18n.ua'])

.config(['$translateProvider', function ($translateProvider) {

    var lang = localStorage.getItem('language');
    if((lang === null) || (lang === "undefined") || !(lang in $translateProvider.translations())){
        lang = 'ru_RU';
        localStorage.setItem('language', lang);
    }
    $translateProvider.uses(lang);
    var to_moment = lang.slice(0,2);
    if(to_moment === 'ua') to_moment = 'uk';
    moment.lang(to_moment);
    // $translateProvider.rememberLanguage(true);   // Not worked yet
}])

.factory('i18n', ['$translate', '$rootScope', function($translate, $rootScope) {

    var moment = window['moment'];

    var i18n = {
        moment: moment,
        langs: [
            {code: 'ru_RU', text: 'RU', moment: 'ru', title: "Русский"},
            {code: 'en_EN', text: 'EN', moment: 'en', title: "English"},
            {code: 'ua_UA', text: 'UA', moment: 'uk', title: "Українська"},
            {code: 'pl_PL', text: 'PL', moment: 'pl', title: "Polski"}
        ]
    };

    i18n.lang = function(lang){
        $translate.uses(lang);
        localStorage.setItem('language', lang);

        var to_moment = lang.slice(0,2);
        if(to_moment === 'ua') to_moment = 'uk';
        moment.lang(to_moment);
    }

    i18n.active = function(){
        return $translate.uses();
    }

    return i18n;
}]);

