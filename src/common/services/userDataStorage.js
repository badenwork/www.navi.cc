/* global angular:true, google:true, moment:true, d3:true */

(function() {
    'use strict';
    angular.module('services.userDataStorage', []).factory('userDataStorage', [function() {
        return {
            getItem: function (key) {
              return localStorage.getItem(key);  
            },
            setItem: function (key, value) {
                localStorage.setItem(key, value);
            }
        };
    }]);

})();
