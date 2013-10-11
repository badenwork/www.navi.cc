angular.module('resources.rest', ['services.connect', 'ngResource'])

// Если я не ощибаюсь, то factory нужно как-то заменить на provider

.factory('REST', ['SERVER', '$http', '$q', 'Connect', function (SERVER, $http, $q, Connect) {

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


    var Model = function(name, value){
        angular.copy(value || {}, this);
        this.$name = name;
    }

    // Отправить на сервер измененное значение одного поля
    Model.prototype.$patch = function(field) {
        var defer = $q.defer();
        var that = this;

        var request = {};
        request[field] = angular.copy(this[field]);

        $http({
            method: 'PATCH',
            url: SERVER.api + "/" + this.$name + "s/" + encodeURIComponent(this.id),
            data: JSON.stringify(request)
        }).success(function(data){
            defer.resolve(data);
        });

        return defer.promise;
    }

    Model.prototype.$isEmpty = function(field) {
        return $.isEmptyObject(angular.copy(field || this));
    }


    // Множество моделей
    var Models = function(name, value){
        angular.copy(value || {}, this);
        this.$name = name;
    }
    
    var removeSysErrors = function(sys) {
        if (sys.dynamic) {
            switch(sys.dynamic.fsource){
                case 2:
                case 3:
                case 4:   
                case 7:
                    sys.dynamic.speed = 0;
                    break;
                default: 
                    break; 
             }
        }
        //if (angular.isUndefined(data.car.hasFuelSensor))
        if (sys.car && angular.isUndefined(sys.car.hasFuelSensor))
            sys.car.hasFuelSensor = false;
    }

    Models.prototype.$add = function(data){
        // var model = new Model(that.name, data);
        var id = data.id;
        removeSysErrors(data);
        if(this.hasOwnProperty(id)){
            angular.extend(this[id], data);
        } else {
            this[id] = new Model(this.$name, data);
        }
        // Оформим подписку на оповещение об обновлении этого экземпляра
        Connect.subscribe(this.$name, id);
        return this[id];
    }

    var REST = function(name){
        this.name = name;
        // this.models = {};   // Сюда будут помещаться все документы: ключ => значение
        this.models = new Models(name, {});
        this.all = false;   // Будет установлен в true после вызова .getall()
        var that = this;

        Connect.on(name, function(message){
            // console.log(that.models);

            if(that.models.hasOwnProperty(message.id)){
                // console.log("extend");
                removeSysErrors(message.data);
                if(message.data === null){  // Неизвестна степень изменений, требуется перезагрузить данные
                    console.log("Full update", that);
                    that.get(message.id, true);
                } else {
                    angular.extend(that.models[message.id], message.data);
                }
                if(that.hasOwnProperty('$update')){
                    that.$update.call(that.models[message.id]);
                }
            }

        });
    }

    REST.prototype.get = function(id, reload){
        var defer = $q.defer();
        var that = this;

        if(!this.models[id] || reload) {
            $http({
                method: 'GET',
                url: SERVER.api + "/" + this.name + "s/" + encodeURIComponent(id)
            }).success(function(data){
                var model = that.models.$add(data);
                if(that.hasOwnProperty('$update')){
                    that.$update.call(model);
                }
                // if(that.models.hasOwnProperty(id)){
                //     angular.extend(that.models[id], data);
                // } else {
                //     that.models[id] = new Model(that.name, data);
                // }
                // // Оформим подписку на оповещение об обновлении
                // Connect.subscribe(that.name, id);

                defer.resolve(that.models[id]);
            });
        } else {
            defer.resolve(this.models[id]);
        }
        return defer.promise;
    }

    REST.prototype.getall = function(reload){
        var defer = $q.defer();
        var that = this;

        if(!this.all || reload) {
            $http({
                method: 'GET',
                url: SERVER.api + "/" + this.name + "s"
            }).success(function(dataall){
                that.all = true;

                dataall.map(function(data){
                    var id = data.id;
                    var model = that.models.$add(data);
                    if(that.hasOwnProperty('$update')){
                        that.$update.call(model);
                    }
                });

                defer.resolve(that.models);
            });
        } else {
            defer.resolve(this.models);
        }
        return defer.promise;
    }

    // Ручное добавление ресурса. Алиас на models.$add(data)
    REST.prototype.add = function(data){
        this.models.$add(data);
    }

    return REST;
}]);

