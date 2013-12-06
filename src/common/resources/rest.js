/* global angular:true, $:true */

angular.module('resources.rest', ['services.connect', 'ngResource'])

// Если я не ощибаюсь, то factory нужно как-то заменить на provider

.factory('REST', ['SERVER', '$http', '$q', 'Connect',
    function(SERVER, $http, $q, Connect) {
        'use strict';

        /*
             Name - имя ресурса, например 'param'

            Запрос с сервера будет каким:
            GET /[name]s/:id

            Запрос всех документов ресурса:
            GET /[name]s

            Изменение ресурса:
            PATCH /[name]/:id
            { "field": "value" }

            При получении уведомления докумен будет обновляться автоматически
        */

        var Model = function(name, value) {
            angular.copy(value || {}, this);
            this.$name = name;
        };

        // Заменяет данные.
        // TODO! Уверен, это можно было сделать проще.
        Model.prototype.$replace = function(data) {
            angular.extend(this, data);
            var fordel = [];
            angular.forEach(this, function(item, key){
                if(key === 'id') return;        // Защищенное поле
                if(key === '$name') return;     // Защищенное поле
                if(data.hasOwnProperty(key)){   // Замена поля
                    angular.copy(data.key, item.key);
                } else {
                    fordel.push(key);
                }
                // console.log('item ', item, ' key', key);
            });
            // console.log('for del', fordel);
            // console.log('this=', this);
            var that = this;
            angular.forEach(fordel, function(key){
                delete that[key];
            });
        }

        // Отправить на сервер измененное значение одного поля
        Model.prototype.$patch = function(field) {
            var defer = $q.defer();

            var request = {};
            request[field] = angular.copy(this[field]);

            $http({
                method: 'PATCH',
                url: SERVER.api + '/' + this.$name + 's/' + encodeURIComponent(this.id),
                data: JSON.stringify(request)
            }).success(function(data) {
                defer.resolve(data);
            });

            return defer.promise;
        };

        Model.prototype.$isEmpty = function(field) {
            return $.isEmptyObject(angular.copy(field || this));
        };

        // Множество моделей
        var Models = function(name, value) {
            angular.copy(value || {}, this);
            this.$name = name;
        };

        // TODO: Метод не вызывает $update
        Models.prototype.$add = function(data) {
            // var model = new Model(that.name, data);
            var id = data.id;
            // removeSysErrors(data);              // Не удачное решение. REST - это не только System
            if (this.hasOwnProperty(id)) {
                this[id].$replace(data);
            } else {
                this[id] = new Model(this.$name, data);
            }
            // Оформим подписку на оповещение об обновлении этого экземпляра
            Connect.subscribe(this.$name, id);
            return this[id];
        };

        var REST = function(name) {
            this.name = name;
            // this.models = {};   // Сюда будут помещаться все документы: ключ => значение
            this.models = new Models(name, {});
            this.all = false; // Будет установлен в true после вызова .getall()
            var that = this;

            Connect.on(name, function(message) {
                if (that.models.hasOwnProperty(message.id)) {
                    // removeSysErrors(message.data);
                    if (message.data === null) { // Неизвестна степень изменений, требуется перезагрузить данные
                        that.get(message.id, true);
                    } else {
                        angular.extend(that.models[message.id], message.data);
                    }
                    if (that.hasOwnProperty('$update')) {
                        that.$update.call(that.models[message.id]);
                    }
                }

            });
        };

        REST.prototype.get = function(id, reload) {
            var defer = $q.defer();
            var that = this;

            if (!this.models[id] || reload) {
                $http({
                    method: 'GET',
                    url: SERVER.api + '/' + this.name + 's/' + encodeURIComponent(id)
                }).success(function(data) {
                    var model = that.models.$add(data);
                    if (that.hasOwnProperty('$update')) {
                        that.$update.call(model);
                    }

                    defer.resolve(that.models[id]);
                });
            } else {
                defer.resolve(this.models[id]);
            }
            return defer.promise;
        };

        REST.prototype.cached = function(id) {
            return this.models[id];
        };

        REST.prototype.getall = function(reload) {
            var defer = $q.defer();
            var that = this;

            if (!this.all || reload) {
                $http({
                    method: 'GET',
                    url: SERVER.api + '/' + this.name + 's'
                }).success(function(dataall) {
                    that.all = true;

                    dataall.map(function(data) {
                        // var id = data.id;
                        var model = that.models.$add(data);
                        if (that.hasOwnProperty('$update')) {
                            that.$update.call(model);
                        }
                    });

                    defer.resolve(that.models);
                });
            } else {
                defer.resolve(this.models);
            }
            return defer.promise;
        };

        // Ручное добавление ресурса. Алиас на models.$add(data)
        REST.prototype.add = function(data) {
            var model = this.models.$add(data);
            if (this.hasOwnProperty('$update')) {
                this.$update.call(model);
            }

        };

        return REST;
    }
]);

