
angular.module('directives.timepicker', ['i18n'])

.directive('timepicker', ['i18n',
    function(i18n) {
        'use strict';

        var link = function(scope, element){
            

            var timepicker = element.find('.inputDate');
            var tp = timepicker.timepicker({
                minuteStep: 10,
                showMeridian: false
            }).on('changeTime.timepicker', function(e) {
                scope.$apply(function() {
                    // var date = parseDate(element.find('.inputDate').val());
                  //  var date = datepicker.datepicker('getDate');
                //    scope.dateFrom = date;
                    //scope.dateTo = date;
                    console.log('The time is ' + e.time.value);
                    console.log('The hour is ' + e.time.hour);
                    console.log('The minute is ' + e.time.minute);
                    console.log('The meridian is ' + e.time.meridian);
                });
                // scope.onChange({foo:'bar'});
            });


            // dp.datepicker('setDate', new Date());

            var daterange = element.find('.input-daterange');
            daterange.datepicker({
                todayBtn: 'linked',
                language: i18n.shortLang(),
                autoclose: true,
                format: 'dd/mm/yyyy',
                todayHighlight: true
            }).on('changeDate', function() {
                scope.$apply(function() {
                    // TODO: Я не знаю как доставать дату из daterange
                    // var start = parseDate(element.find('input[name="start"]').val());
                    // var stop  = parseDate(element.find( 'input[name="stop"]').val());
                    var start = element.find('input[name="start"]').datepicker('getDate');
                    scope.dateFrom = start;
                    var stop = element.find('input[name="stop"]').datepicker('getDate');
                    scope.dateTo = stop;

                    // scope.onChange({start: start, stop: stop});
                    // dp.datepicker('setDate', start);
                });
                // scope.onChange();
            });


            scope.selectday = function(day){
                console.log('selectday', day);
            };

            scope.toggleRange = function(){
                scope.range = true;

                var date = datepicker.datepicker('getDate');
                scope.dateFrom = date;
                scope.dateTo = date;
                // element.find('input[name="start"]').datepicker('setDate', date);
                // element.find('input[name="stop"]').datepicker('setDate', date);
            };

            scope.toggleSingle = function(){
                scope.range = false;

                var start = element.find('input[name="start"]').datepicker('getDate');
                // scope.dateFrom = start;
                dp.datepicker('setDate', start);
                if(scope.dateFrom != scope.dateTo){
                    scope.dateTo = start;
                    // scope.onChange();
                }
            };

            scope.$watch('dateFrom', function(){
                // console.log('dateFrom=', scope.dateFrom);
                element.find('input[name="start"]').datepicker('setDate', scope.dateFrom);
                if(!scope.range) {
                    dp.datepicker('setDate', scope.dateFrom);
                }
            });

            scope.$watch('dateTo', function(){
                // console.log('dateTo=', scope.dateTo);
                element.find('input[name="stop"]').datepicker('setDate', scope.dateTo);
            });

            scope.prevDay = function(){
                var format = d3.time.format('%d/%m/%Y');
                var prev = format.parse(format(moment(scope.dateFrom).subtract('days', 1).toDate()));
                scope.dateFrom = prev;
                scope.dateTo = prev;
                console.log('prevDay', scope.dateFrom, prev);
            };

            scope.nextDay = function(){
                var format = d3.time.format('%d/%m/%Y');
                var next = format.parse(format(moment(scope.dateFrom).add('days', 1).toDate()));
                scope.dateFrom = next;
                scope.dateTo = next;
                console.log('nextDay', scope.dateFrom, next);
            };

        };
        return {
            restrict: 'E',
            scope: {
                dateFrom: '=',
                dateTo: '=',
                range: '='
                // onChange: '&'
            },
            // template: '<svg width='500px' height='250px' class='chart'></svg>',
            template:
                '<div>'+
                    '<div class="btn-group" ng-hide="range">'+
                        '<button class="btn btn-primary" ng-click="prevDay()">&lt;</button>'+
                        '<input  class="btn btn-primary inputDate" />'+
                        '<button class="btn btn-primary" ng-click="toggleRange()">&hellip;</button>'+
                        '<button class="btn btn-primary" ng-click="nextDay()">&gt;</button>'+
                    '</div>'+

                    '<div class="btn-group input-daterange" ng-show="range">'+
                        '<input class="btn btn-primary" name="start" />'+
                        '<button class="btn btn-primary" ng-class="" ng-click="toggleSingle()">&hellip;</button>'+
                        '<input class="btn btn-primary" name="stop" />'+
                    '</div>'+
                '</div>',

            replace: true,
            link: link
            // controller: ['$scope', '$element', function($scope, $element){}]
        };
    }
]);