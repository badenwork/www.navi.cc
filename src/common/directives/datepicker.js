/* global angular:true, moment:true, d3:true */

angular.module('directives.datepicker', ['i18n'])

.directive('datepicker', ['i18n',
    function(i18n) {
        'use strict';

        var link = function(scope, element){
            // console.log('datepicker scope=', scope);

            var intervalpicker = element.find('#intervalpicker');
            intervalpicker.intervalpicker({
                defaultStart: scope.timeFrom,
                defaultStop: scope.timeTo
            });
            var datepicker = element.find('.inputDate');
            var dp = datepicker.datepicker({
                todayBtn: 'linked',
                language: i18n.shortLang(),
                autoclose: true,
                format: 'dd/mm/yyyy',
                todayHighlight: true
            }).on('changeDate', function() {
                scope.$apply(function() {
                    // var date = parseDate(element.find('.inputDate').val());
                    var date = datepicker.datepicker('getDate');
                    scope.dateFrom = date;
                    scope.dateTo = moment(date).add('seconds', 24*60*60-1).toDate();
                    scope.hfrom = '00'; scope.hto = '23';
                    scope.timeFrom = 0;
                    scope.timeTo = 23;
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
                    scope.dateTo = moment(stop).add('seconds', 24*60*60-1).toDate();
                    scope.hfrom = '00'; scope.hto = '23';
                    scope.timeFrom = 0;
                    scope.timeTo = 23;

                    // scope.onChange({start: start, stop: stop});
                    // dp.datepicker('setDate', start);
                });
                // scope.onChange();
            });


            // scope.selectday = function(day){
                // console.log('selectday', day);
            // };

            scope.toggleRange = function(){
                scope.range = true;

                var date = datepicker.datepicker('getDate');
                scope.dateFrom = date;
                scope.dateTo = moment(date).add('seconds', 24*60*60-1).toDate();
                // element.find('input[name="start"]').datepicker('setDate', date);
                // element.find('input[name="stop"]').datepicker('setDate', date);
            };

            scope.toggleSingle = function(){
                scope.range = false;

                var start = element.find('input[name="start"]').datepicker('getDate');
                // scope.dateFrom = start;
                dp.datepicker('setDate', start);
                if(scope.dateFrom != scope.dateTo){
                    scope.dateTo = moment(start).add('seconds', 24*60*60-1).toDate();
                    // scope.onChange();
                }
            };

            scope.hourFromDiv = false;
            scope.hfrom = '00';
            scope.timeFrom = 0;
            scope.timeTo = 23;
            scope.hourFrom = function(){
                // console.log('Hour from');
                scope.hourFromDiv = true;
            };
            scope.hourFromDo = function(h){
                // console.log('Hour from do', h);
                scope.hourFromDiv = false;
                scope.hfrom = h;
                scope.timeFrom = parseInt (h);

                var start = element.find('input[name="start"]').datepicker('getDate');
                // scope.dateFrom = start;
                var format = d3.time.format('%d/%m/%Y');
                var day = format.parse(format(moment(start).toDate()));
                scope.dateFrom = moment(day).add('hours', h*1).toDate();

                // scope.dateFrom = format.parse(format(moment(start).add('hours', (h*1)).toDate()));
                // var stop = element.find('input[name="stop"]').datepicker('getDate');
                // scope.dateTo = stop;
            };

            scope.hourToDiv = false;
            scope.hto = '23';
            scope.hourTo = function(){
                scope.hourToDiv = true;
            };
            scope.hourToDo = function(h){
                // console.log('Hour to', h);
                scope.hourToDiv = false;
                scope.hto = h;
                scope.timeTo = parseInt (h);

                var stop = element.find('input[name="stop"]').datepicker('getDate');
                // scope.dateTo = start;
                var format = d3.time.format('%d/%m/%Y');
                var day = format.parse(format(moment(stop).toDate()));
                scope.dateTo = moment(day).add('hours', h*1).add('seconds', 60*60-1).toDate();

                // scope.dateFrom = format.parse(format(moment(start).add('hours', (h*1)).toDate()));
                // var stop = element.find('input[name="stop"]').datepicker('getDate');
                // scope.dateTo = stop;
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
                scope.dateTo = moment(prev).add('seconds', 24*60*60-1).toDate();
                scope.hfrom = '00'; scope.hto = '23';
                scope.timeFrom = 0;
                scope.timeTo = 23;
                // console.log('prevDay', scope.dateFrom, prev);
            };

            scope.nextDay = function(){
                var format = d3.time.format('%d/%m/%Y');
                var next = format.parse(format(moment(scope.dateFrom).add('days', 1).toDate()));
                scope.dateFrom = next;
                scope.dateTo = moment(next).add('seconds', 24*60*60-1).toDate();
                scope.hfrom = '00'; scope.hto = '23';
                scope.timeFrom = 0;
                scope.timeTo = 23;
                // console.log('nextDay', scope.dateFrom, next);
            };

        };
        return {
            restrict: 'E',
            scope: {
                dateFrom: '=',
                dateTo: '=',
                hoursFrom: '=',
                range: '=',
                timeFrom: '=',
                timeTo: '=',
                intervalPicker: '='
                // onChange: '&'
            },
            // template: '<svg width='500px' height='250px' class='chart'></svg>',
            template:
                '<div style="position:relative; z-index: 10000;">'+
                    '<div class="btn-group" ng-hide="range">'+
                        '<button class="btn btn-primary" ng-click="prevDay()">&lt;</button>'+
                        '<input  class="btn btn-primary inputDate" />'+
                        '<button class="btn btn-primary" ng-click="nextDay()">&gt;</button>'+
                        //'<button id="intervalpicker" ng-show="intervalPicker" class="btn btn-primary">{{timeFrom + " - " + timeTo}}</button>'+
                        '<button class="btn btn-primary" ng-click="toggleRange()">&hellip;</button>'+
                    '</div>'+

                    '<div class="btn-group input-daterange" ng-show="range">'+
                        '<input class="btn btn-primary" name="start" />'+
                        '<button class="btn btn-primary" ng-click="hourFrom()">{{ hfrom }}:00</button>'+
                        '<button class="btn btn-primary" ng-class="" ng-click="toggleSingle()">&hellip;</button>'+
                        '<input class="btn btn-primary" name="stop" />'+
                        '<button class="btn btn-primary" ng-click="hourTo()">{{ hto }}:59</button>'+
                    '</div>'+

                    '<div ng-show="hourFromDiv" class="input-daterange-hours"><div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'00\')">00</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'01\')">01</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'02\')">02</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'03\')">03</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'04\')">04</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'05\')">05</button>'+
                        '</div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'06\')">06</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'07\')">07</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'08\')">08</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'09\')">09</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'10\')">10</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'11\')">11</button>'+
                        '</div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'12\')">12</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'13\')">13</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'14\')">14</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'15\')">15</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'16\')">16</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'17\')">17</button>'+
                        '</div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'18\')">18</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'19\')">19</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'20\')">20</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'21\')">21</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'22\')">22</button>'+
                            '<button class="btn btn-primary" ng-click="hourFromDo(\'23\')">23</button>'+
                        '</div>'+
                    '</div></div>'+

                    '<div ng-show="hourToDiv" class="input-daterange-hours"><div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'00\')">01</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'01\')">02</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'02\')">03</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'03\')">04</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'04\')">05</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'05\')">06</button>'+
                        '</div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'06\')">07</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'07\')">08</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'08\')">09</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'09\')">10</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'10\')">11</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'11\')">12</button>'+
                        '</div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'12\')">13</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'13\')">14</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'14\')">15</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'15\')">16</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'16\')">17</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'17\')">18</button>'+
                        '</div>'+
                        '<div class="btn-group">'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'18\')">19</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'19\')">20</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'20\')">21</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'21\')">22</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'22\')">23</button>'+
                            '<button class="btn btn-primary" ng-click="hourToDo(\'23\')">24</button>'+
                        '</div>'+
                    '</div></div>'+
                '</div>',

            replace: true,
            link: link
            // controller: ['$scope', '$element', function($scope, $element){}]
        };
    }
]);
