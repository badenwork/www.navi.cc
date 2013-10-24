/* global angular:true, google:true, moment:true, d3:true */

/*
    Маркеры последних известных положений ТС.
*/

angular.module('services.tags', ['resources.system', 'resources.account'])

.factory('Tags', [
    'Account',
    'System',
    '$filter',
    function(Account, System, $filter) {
        'use strict';

        // console.log('tags service', Account);
        var set = {};

        var Tags = {
            filters: [],    // Ярлыки, используетые в системах
            all: []         // Все ярлыки, включая тe, что уже не используются
        };


        Tags.reload = function(){
            if(!Account.account) return;
            // console.log('Account=', Account);

            Tags.all = [];
            // Уже используемые теги
            if(Account.account.tags){
                Tags.all = angular.copy(Account.account.tags);
            }

            // console.log('All1 = ', angular.copy(Tags.all));

            var skeys = Account.account.skeys;

            skeys.map(function(skey){
                var system = System.cached(skey);
                if (system && system.tags) {
                    system.tags.map(function(tag) {
                        if (!set.hasOwnProperty(tag)) {
                            set[tag] = tag;
                            if(Tags.all.indexOf(tag) === -1) Tags.all.push(tag);
                            Tags.filters.push({
                                desc: tag,
                                filter: tag
                            });
                        }
                    });
                }
            });
            // console.log('All2 = ', angular.copy(Tags.all));

            Tags.save();
        };

        // Обновим список тегов пользователя для использования в будущем.
        Tags.save = function () {
            if(!Account.account) return;
            if(!Account.account.hasOwnProperty('tags') || !angular.equals(Account.account.tags, Tags.all)){
                Account.account.tags = angular.copy(Tags.all);
                // console.log('Upgate account.tags');
                Account.$patch('tags');
            }
        };

        return Tags;
    }
]);

