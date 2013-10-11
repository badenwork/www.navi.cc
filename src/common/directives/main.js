angular.module('directives.lists', [])

.directive('mylist', function() {
    return {
        restrict: 'E',
        transclude: false,
        template: '<div>List:<ul><li ng-repeat="l in list"><mylistitem></mylistitem></li></ul></div>'
    };
})

.directive('mylistitem', function() {
    return {
        restrict: 'E',
        //scope: {l:"@"},
        transclude: true,
        template: '<div>{{l}}</div>'
    };
})

.directive('mylist2', function() {
    return {
        restrict: 'E',
        scope: {},
        transclude: false,
        //template: '<div>List2:<ul><li ng-repeat="l in list">{{ l }}</li></ul></div>',
        template: '<div>List2:<ul></ul></div>',
        link: function(scope, element, attrs) {
            var ul = element[0].querySelector('ul');
            //scope.ul = ul;
            scope.list = scope.$parent.list;
            //var ul = angular.element(element);
            scope.$watch('list', function(ov, nv){
                //console.log(' == watch(list)', scope, ov, nv);
                ul.innerHTML = '';
                for(var i=0; i<scope.list.length; i++){
                    var l=scope.list[i];
                    var li = document.createElement('LI');
                    li.innerHTML = l;
                    ul.appendChild(li);
                }
            }, true);
            //console.dir(element);
            //console.dir(ul);
        }/*,
        compile: function(element, attrs) {
            console.log('mylist2 directive: compile', element, attrs);
        }
        , controller: ["$scope", function($scope) {
            console.log('mylist2 directive: controller', $scope);
            $scope._addMyData = "Hoo";
        }]*/
    };
})


.directive('contenteditable',  ['$filter', function($filter) {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attr, ngModel) {

            var read;
            var translate = $filter('translate');
            element.attr('title', translate('contenteditableTitle'));
            if (!ngModel) {
                return;
            }
            var translate = $filter('translate');
            element.attr('title', translate('contenteditableTitle'));
            ngModel.$render = function() {
                return element.text(ngModel.$viewValue);
            };

            /* Позволим ставить курсор в поле нулевой длины */
            element.click(function(e) {
                e.preventDefault();

                // var div = $(this).parent().children("div")[0];
                var div = element[0];
                if(document.activeElement == div) return;
                div.focus();

                if (window.getSelection && document.createRange) {
                    // IE 9 and non-IE
                    var sel = window.getSelection();
                    var range = document.createRange();
                    range.setStart(div, 0);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                } else if (document.body.createTextRange) {
                    // IE < 9
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(div);
                    textRange.collapse(true);
                    textRange.select();
                }
            });
            element.bind('blur', function() {
                console.log("blur", ngModel.$viewValue, element.html());
                // if($.trim(element.text()) === '') {
                //     element.text(ngModel.$viewValue);
                //     //scope.$apply();
                // }
                if (ngModel.$viewValue !== $.trim(element.text())) {
                    return scope.$apply(read);
                }
            });
            element.bind('keypress', function(ev) {
                //console.log("keypress", ev);
                if(ev.which === 13){
                    element.trigger('blur');
                    return false;
                }
            });
            read = function() {
                // console.log("read()", scope, ngModel);
                ngModel.$setViewValue($.trim(element.text()));
                element.trigger('change');  // Вызовем стандартный метод onChange, можно повесить свой обработчик на ng-change="onChange()"
                /*
                if(scope._update){
                    scope._update();
                }
                */
                /*if(scope.onChange) {
                    scope.onChange();
                }*/
                //return ngModel.$setViewValue($.trim(element.html()));
            };
            //return read;
        }
    };
}])

.directive('fileload', function() {
    return {
        restrict: 'E',
        require: '?ngModel',
        template: '<span class="btn btn-success fileinput-button">' +
                  '  <i class="icon-plus icon-white"></i>' +
                  '  <span>Из файла...</span>' +
//                  ' <input type="file" name="files[]" multiple="" ng-model="files" ng-change="onFileAdd()">' +
                  ' <input type="file">' +
                  '</span>',
        replace: true,
        link: function(scope, element, attr, ngModel) {
            scope.onFileAdd = function(){
                console.log('onFileAdd');
            };
            /*var input = document.createElement('input');
            input.setAttribute('type', 'file');
            //input.type = 'file';
            element.appendChild(input);*/
            element[0].querySelector('input').addEventListener('change', function (ev) {
                //var filename = ev.target.value;
                if((ev.target.value === null)||(ev.target.value === '')) {
                    return;
                }
                var file = ev.target.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    var list = e.target.result.replace(/[\r\t\n]/g, ' ').replace(/ {2}/g, ' ').split(' ').filter(function(el){return (el !== '') && (el !== ' ');});
                    scope.$apply(function(){
                        ngModel.$setViewValue(list);
                        element.trigger('change');  // Вызовем стандартный метод onChange, можно повесить свой обработчик на ng-change="onChange()"
                        ev.target.value = null;
                    });
                };
                reader.readAsBinaryString(file);

            }, false);
            /*
            element.bind('change', function(ev){
                console.log('onChange', this, ev.target);
                scope.$apply(function(){
                    scope.files = ['1', '2', '3'];
                    ngModel.$setViewValue(['1', '2', '232']);
                    element.trigger('change');  // Вызовем стандартный метод onChange, можно повесить свой обработчик на ng-change="onChange()"
                });
            });
            */

            /*
            element.querySelector('input').addEventListener('change', function(){
                console.log('onChange');
            }, false);*/
        }
    };
})

.directive('addtracker', function() {
    return {
        restrict: 'E',
        require: '?ngModel',
        scope: {
            account: "=",
            systems: "="
        },
        template: '<div><button class="btn btn-primary" ng-click="addform=!addform;"><i class="icon-plus-sign"></i><span translate>add_system</span></button>' +
                    '<span ng-show="addform">' +
                    '   <br><form class="form-inline" style="display: inline-block; margin:0;" name="form" ng-submit="onAdd(newimei)">' +
                    '        <label style="display:inline">IMEI</label>' +
                    '       <input class="form-control" type="text" ng-model="newimei" required autofocus></input>' +
                    '        <button class="btn btn-primary login" id="login" ng-show=\'!form.$invalid\'>Добавить</button>' +
                    '        <a class="btn btn-primary" ng-click="onGroupSyss()" title="Добавить все трекеры компании"><i class="icon-group" style="margin:0"></i></a>' +
                    '       <fileload ng-model="files" ng-change="onFromFiles()"></fileload>' +
                    '    </form>' +
                    '</span></div>',
        replace: true,
        link: function(scope, element, attr, ngModel) {
        },
        controller: ["$scope", "Account", function($scope, Account){
            $scope.addform = false;

            var add = function(imeis){
                Account.systemadd(imeis, function(system){
                    console.log("system=", system);
                    // $scope.systems[system.id] = System.add(system);
                    // System.add(system);
                    $scope.systems.$add(system);
                });
            }

            $scope.onAdd = function(imei){
                console.log('onAdd', imei, $scope.account, document.getElementById('config_add_file'));

                add([imei]);
                // $scope.account.systemadd([imei]);
                $scope.addform = false;
            };

            $scope.onGroupSyss = function(){
                console.log("TODO: Добавить все трекеры компании.");
                $scope.addform = false;
            };

            $scope.onFromFiles = function(){
                console.log('TODO! multiple add', $scope.files);
                add($scope.files);
                // Account.systemadd($scope.files);
                // $scope.account.systemadd($scope.files);
                $scope.addform = false;
            };
        }]
    }
})

.directive('clone', function() {
    return {
        restrict: 'C',
        // template: null,
        // replace: true,
        link: function(scope, element, attr, ngModel) {
            // console.log('clone component');
            element.attr('readonly', 'readonly');
            element.attr('type', 'text');
            element.attr('title', "Для копирования в буффер обмена нажмите правую кнопку и выберите 'Копировать'");
            element.bind('mousedown', function(){this.select();});
            //element.bind('mouseover', function(){this.select();});
        }
    }
})

.directive('datetime', [function(){
    return {
        restrict: 'E',
        scope: {
            datetime: "@",
            "default": "@",
            format: "@",
            seconds: "="
        },
        template: '<span class="datelabel" title="{{ title }}" ng-click="switch()">{{ value }}</span>',
        controller: ["$scope", "$filter", function($scope, $filter){
            $scope.invert = $scope["default"] || false;
            //$scope.format =
            var update = function(){
                // console.log("$scope.seconds", $scope.seconds);
                // console.log('$scope.datetime=', $scope.datetime);
                if(angular.isUndefined($scope.datetime) || $scope.datetime === ''){
                    $scope.value = "?";
                    $scope.title = "Значение неопределено";
                    return;
                }
                if($scope.invert){
                    $scope.value = $filter("datetime")($scope.datetime, $scope.seconds, $scope.format);
                    $scope.title = $filter("fromnow")($scope.datetime);
                } else {
                    $scope.value = $filter("fromnow")($scope.datetime);
                    $scope.title = $filter("datetime")($scope.datetime, $scope.seconds, $scope.format);
                }
            };
            $scope.switch = function(){
                $scope.invert = !$scope.invert;
                update();
            };
            $scope.enter = function(){
                $scope.invert = true;
                update();
            };
            $scope.leave = function(){
                $scope.invert = false;
                update();
            };
            $scope.$watch("datetime", update);
            $scope.$on('timetick', update);

        }]
    };
}])

.directive('navtool', [function(){
    return {
        restrict: 'E',
        template: '<div class="btn-group">' +
                    '<a type="button" class="btn btn-info" ng-click="back()" title="Назад">&lt;</a>' +
                    '<a type="button" class="btn btn-info" href="#/map" title="Карта"><i class="icon-map-marker" style="margin:0"></i></a>' +
                    '<a type="button" class="btn btn-info" href="#/config" title="Настройки"><i class="icon-gears" style="margin:0"></i></a>' +
                    '<a type="button" class="btn btn-info" href="#/help" title="Помощь"><i class="icon-medkit" style="margin:0"></i></a>' +
                  '</div>',
        controller: ["$scope", "$window", function($scope, $window){
            $scope.back = function(){
                $window.history.back();
            };

        }]
    };
}])

.directive('focusMe', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            attrs.$observe('focusMe', function(value) {
                if ( value==="true" ) {
                    $timeout(function(){
                        element[0].focus();
                    }, 100);
                }
            });
        }
    }
}]);
