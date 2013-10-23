/* global angular:true, console:true */

angular.module('services.connect', [])

.factory('Connect', ['$rootScope', 'SERVER', function($rootScope, SERVER) {
    'use strict';

    var shared = {
        scope: $rootScope.$new(true)
    };

    // Список ресурсов, на которые оформлена подписка-слежение за обновлением
    // Примитивная реализация set
    var Subscribes = function() {
        this.set = {};
    };

    Subscribes.prototype.add = function(resource, id) {
        var key = resource + ':' + id;
        this.set[key] = {
            resource: resource,
            id: id
        };
    };

    Subscribes.prototype.isEmpty = function(){
        for(var key in this.set) {
            if (this.set.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    };

    Subscribes.prototype.forEach = function(callback) {
        for(var key in this.set){
            if (this.set.hasOwnProperty(key)) {
                callback(this.set[key]);
            }
        }
    };

    Subscribes.prototype.toArray = function() {
        var array = [];
        for(var key in this.set){
            if (this.set.hasOwnProperty(key)) {
                array.push(this.set[key]);
            }
        }
        return array;
    };

    var subscribes = new Subscribes();

    //var ws_server = 'ws://gpsapi04.navi.cc:8888/socket';
    //var ws_server = 'http://gpsapi04.navi.cc:8888/socket';
    //baseUrl: ((location.hostname === 'localhost') || (location.hostname === 'bigbrother')) ? 'http://localhost:8183/' : 'http://api.newgps.navi.cc/'

    //var ws_server = 'http://localhost:8888/socket';
    var ws_server = SERVER.channel;
    var ws = null;

    var connect = function(timeout){
        if(timeout>60) { timeout = 60; }
        console.log('connecting to ' + ws_server + '...');

        //new SockJS(ws_server)
        ws = new WebSocket(ws_server);
        ws.onopen = function () {
            console.log('WebSocket connected');
            if(!subscribes.isEmpty()){
                ws.send(JSON.stringify({
                    subscribe: subscribes.toArray()
                }));
            }

        };
        ws.onmessage = function(event) {
            var msg = JSON.parse(event.data);
            shared.scope.$emit('update', msg);
        };
        ws.onclose = function() {
            ws = null;
            console.log('WebSocket disconnected');
            setTimeout(function(){
                connect(timeout*2);
            }, timeout*1000);
        };
    };
    connect(1);

    shared.subscribe = function(resource, id) {
        subscribes.add(resource, id);
        if(ws){
            if(ws.readyState === ws.OPEN){
                ws.send(JSON.stringify({
                    subscribe: [{
                        resource: resource,
                        id: id
                    }]
                }));
            }
        }
    };

    shared.on = function(resource, callback){
        shared.scope.$on('update', function(event, message){
            if(message.messages){
                var m = message.messages;
                m.map(function(msg){
                    if(msg.resource === resource){
                        $rootScope.$apply(function(){
                            callback(msg);
                        });
                    }
                });
            }
        });
    };

    return shared;
}]);

