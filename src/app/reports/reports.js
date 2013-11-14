angular.module('reports', ['ngRoute', 'directives.datepicker', 'resources.account', '$strap.directives', 'resources.geogps', 'resources.system', 'i18n', 'resources.reports', 'resources.templates', 'reports.chart'])

.config(['$routeProvider',
    function($routeProvider) {

        $routeProvider.when('/reports', {
            templateUrl: 'templates/reports/reports.tpl.html',
            controller: 'ReportsViewCtrl',
            resolve: {
                account: ['Account',
                    function(Account) {
                        //TODO: sure for fetch only one for the current user
                        return Account.get();
                    }
                ],
                systems: ['System',
                    function(System) {
                        return System.getall();
                    }
                ]
            },
            reloadOnSearch: false
        }).
        when('/reports:skey', {
            templateUrl: 'templates/reports/reports.tpl.html',
            controller: 'ReportsViewCtrl',
            resolve: {
                account: ['Account',
                    function(Account) {
                        //TODO: sure for fetch only one for the current user
                        return Account.get();
                    }
                ],
                systems: ['System',
                    function(System) {
                        return System.getall();
                    }
                ]
            },
            reloadOnSearch: false
        });
    }
])

.factory('$strapConfig', ['i18n',
    function(i18n) {

        return {
            datepicker: {
                autoclose: true,
                language: i18n.shortLang()
            }
        };
    }
])

.controller('ReportsViewCtrl', ['$scope', 'account', 'systems', '$routeParams', 'i18n', 'Reports', 'Templates',
    function($scope, account, systems, $routeParams, i18n, Reports, Templates) {

        'use strict';

        $scope.account = account;
        $scope.systems = systems;
        $scope.Reports = Reports;
        $scope.Templates = Templates;
        $scope.fullReportData = Templates.createFullSingleTemplate ();
        $scope.reportSettings = {
            interval: {
                start: new Date(),
                stop: new Date(),
                range: false,
                timeStart: 0,
                timeStop: 24
            },
            systemKey: $routeParams.skey,
            template: Templates.templates [0]
        };
        $scope.templatesSettings = {
            reportRadio: 'main',
            currentTemplate: Templates.templates [0]
        };
        $scope.addNewTemplate = function () {
            Templates.addNewTemplate ();
            $scope.templatesSettings.currentTemplate = Templates.templates [Templates.templates.length - 1];
        };
        $scope.removeTemplate = function (template) {
            Templates.removeTemplate ();
            $scope.templatesSettings.currentTemplate = Templates.templates [0];
        };
        $scope.showTamplatesSettings = function () {
            var options = {};
            $scope.templatesSettings.currentTemplate = Templates.templates [0];
            $('#templatesSettingsModal').modal (options);
        };

        $scope.openInNewPage = function (url) {
            var path = (url ? ('#/singleReport' + url) : '/#/error');
            var fullUrl = window.location.origin + '/' + path;
            //TODO: реализовать сохранение ссылки в буфер обмена
            //window.prompt ("Чтобы скопировать текст в буфер обмена, нажмите Ctrl+C и Enter", fullUrl);
            //window.location = fullUrl;
            window.location.href = path;

            //window.open (fullUrl, path);
        };

        $scope.generateReport = function() {
            if (!$scope.reportSettings.systemKey)
                return;
            var hStart = Reports.dateToHours ($scope.reportSettings.interval.start);
            var hStop = Reports.dateToHours ($scope.reportSettings.interval.stop) + 23;
            var report = Reports.getEmptySingleReport ($scope.reportSettings.systemKey, hStart, hStop, Templates.templateToReadonleTemplate ($scope.reportSettings.template));
            report.system = systems [$scope.reportSettings.systemKey];
            report.systemName = report.system.title;
            Reports.saveReport (report);
            $scope.openInNewPage (report.url);
        };
}]);
