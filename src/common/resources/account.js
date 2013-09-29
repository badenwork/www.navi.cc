angular.module('resources.account', []);

angular.module('resources.account').factory('Account', ['SERVER', '$http', '$q', '$timeout', 'Connect', '$rootScope', 'System', function (SERVER, $http, $q, $timeout, Connect, $rootScope, System) {

  var Account = {
    // 'access_token': null,
    account: null,
    skey: null    // Выбранный skey. Используется как глобальное значение сквозь все страницы (Устаревшее)
  };

  $rootScope.$on('$routeChangeSuccess', function(angularEvent, current, previous){
    Account.skey = current.params.skey;
  });

  Account.get = function(reload){
    var defer = $q.defer();

    if(!Account.account || reload){

      if(!SERVER.api_withCredentials) {
        Account.access_token = localStorage.getItem('access_token');
        if(Account.access_token){
          $http.defaults.headers.common["Authorization"] = "Bearer " + Account.access_token;
        } else {
          delete $http.defaults.headers.common["Authorization"];
        }
      }

      $http({
        method: 'GET',
        url: SERVER.api + "/account"
      }).success(function(data){
        console.log('login data=', data);

        if(data) {
          Account.account = data;
          Account.isAuthenticated = true;
        }

        defer.resolve(Account);
      });
    } else {
      defer.resolve(Account);
    }

    return defer.promise;
  }

  Account.systemsUpdate = function(){
    // TODO! Требуется унификация обработки массива систем
    angular.forEach(Account.account.systems, function(s, key){
      if(s.params && s.params.fuel){
        // console.log('fuel=', s.params.fuel, System.fuelrecalc(s.params.fuel));
        s.params.fuelarray = System.fuelrecalc(s.params.fuel);
      }
    });
  }

  Account.logout = function(){
    var defer = $q.defer();
    console.log('Account.logout');
    Account.access_token = null;
    Account.account = null;
    Account.isAuthenticated = false;

    if(SERVER.api_withCredentials) {
      $http.get(SERVER.api + '/logout', {}).success(function(data) {
        defer.resolve();
      });
    } else {
      localStorage.removeItem('access_token');
      if($http.defaults.headers.common["Authorization"]){
        delete $http.defaults.headers.common["Authorization"];
      }
      defer.resolve();
    }
    return defer.promise;
  };

  Account.login = function(username, password){
    var defer = $q.defer();
    console.log('Account.login', username, password);
    $http.post(SERVER.api + '/auth', {grant_type: "password", username: username, password:password}).success(function(data) {
      console.log('login data=', data);

      if(!SERVER.api_withCredentials) {
        localStorage.setItem('access_token', data.access_token);
        $http.defaults.headers.common["Authorization"] = data.access_token;
      }

      Account.account = data;

      Account.isAuthenticated = true;
      defer.resolve();

    }).error(function(data, status){
      defer.reject();
    });
    return defer.promise;
  };


  Account.register = function(credentials){
    var defer = $q.defer();
    $http.post(SERVER.api + '/register', credentials)
      .success(function(data, status) {
        defer.resolve(data, status);
      })
      .error(function(data, status){
        console.log('Account.register fail result', data, status);
        var resource = data.errors[0].resource;
        var code = data.errors[0].code;

        if(status === 409){
          if(resource === "Group"){
            if(code === "exist"){
              return defer.reject("groupexist");
            } else if(code === "wrongpassword"){
              return defer.reject("grouppassword");
            }
          } else if(resource === "GroupMember"){
            if(code === "exist"){
              return defer.reject("userexist");
            }
          }
        } else if(status === 404){
          if(resource === "Group"){
            if(code === "notfound"){
              return defer.reject("nogroup");
            }
          }
        }
        defer.reject(data, status);
      });
    return defer.promise;
  };


  Account.systemadd = function(imeis){
    $http({
      method: 'POST',
      url: SERVER.api + "/account/systems",
      data: {cmd: 'add', imeis: imeis}
    }).success(function(data){
      console.log('return data=', data);
      var systems = data;
      if(systems.length === 1) {
        if(data[0].result === "already"){
          alert('Вы уже наблюдаете за этой системой.');
          return;
        }
        if(data[0].result === "notfound"){
          alert('Система на найдена. Возможные причины: \n1. Система еще не выходила на связь.\n2. Проверте правильность ввода IMEI.');
          return;
        }
      }
      for(var i=0; i<systems.length; i++) {
        var item = systems[i];
        if(item.result === "added") {
          Account.account.skeys.push(item.system.id);
          System.add(item.system);
          // Account.systemsUpdate();
        }
      }
    });
  };

  Account.systemsort = function(){
    $http({
      method: 'POST',
      url: SERVER.api + "/account/systems",
      data: {cmd: 'sort', skeys: Account.account.skeys}
    }).success(function(data){
      console.log('return data=', data);
    });
  };

  Account.systemdel = function(skey){
    $http({
      method: 'DELETE',
      url: SERVER.api + "/account/systems/" + encodeURIComponent(skey)
    }).success(function(data){
      console.log('return data=', data);
      var i = Account.account.skeys.indexOf(skey);
      Account.account.skeys.splice(i, 1);
      // delete Account.account.systems[skey];
    });
  };


  Account.update = function(param){
    //console.log('Account.update', param);
    $http({
      method: 'PATCH',
      url: SERVER.api + "/account",
      data: JSON.stringify(param)
    }).success(function(data){
      console.log('return data=', data);
    });
  };

  // Подготовка к унификации
  Account.$patch = function(field){
    var data = {};
    data[field] = Account.account[field];

    $http({
      method: 'PATCH',
      url: SERVER.api + "/account",
      data: JSON.stringify(data)
    }).success(function(data){
      console.log('return data=', data);
    });
  }

  Account.setSkey = function(skey){
    Account.skey = skey;
  };

  Connect.on('account', function(message){
      console.log("account/update event", message, Account.account);
      if(Account.account.username === message.id){
        angular.extend(Account.account, message.data);
      }
  });

  return Account;
}]);
