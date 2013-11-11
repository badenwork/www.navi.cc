angular.module('resources.templates', ['resources.account', 'resources.system'])

.factory('Templates', ['Account', '$http', 'SERVER', 'GeoGPS', 'System', '$filter',
    function(Account, $http, SERVER, GeoGPS, System, $filter) {
    var Templates = {
        templates: []
    };
    Templates.createFullSingleTemplate = function () {
        var fullTemplate = {
            mE: ['s','m','re','fD'],
            mD: ['c','i','cFLa','cFL','fL','d','aS','dT'],
            sE: ['dT','tTT','aS','tTOPAS','mS','fCs','fCa','tF','tDF'],
            sD: ['v']
        };
        return fullTemplate;
    };
    Templates.templateToReadonleTemplate = function (template) {
        var rTemplate = {
            mE: Templates.objectsToItems (template.mE),
            mD: Templates.objectsToItems (template.mD),
            sE: Templates.objectsToItems (template.sE),
            sD: Templates.objectsToItems (template.sD)
        };
        
        return rTemplate;
    };
    Templates.itemsToObjects = function (items) {
        var ret = [];
        for (var i = 0; i < items.length; i++) {
            ret.push ({value: items [i], on: true});
        }
        return ret;
    };
    Templates.objectsToItems = function (objects) {
        var items = [];
        for (var i = 0; i < objects.length; i++) {
            if (objects [i].on) {
                items.push (objects [i].value);   
            }
        }
        return items;
    };
    Templates.createNewTemplate = function (name) {
        var fullData = Templates.createFullSingleTemplate ();
        var ret = {
            mE: Templates.itemsToObjects (fullData.mE),
            mD: Templates.itemsToObjects (fullData.mD),
            sE: Templates.itemsToObjects (fullData.sE),
            sD: Templates.itemsToObjects (fullData.sD),
            sI: 0,
            name: name
        };
        return ret;
    };
    var name = $filter("translate")('Full template');
    Templates.templates.push (Templates.createNewTemplate (name));
    if (Account.account.templates) {
        Account.account.templates = Templates.templates;
    }
    Templates.toggleMDItem = function (template, item) {
        item.on = !item.on;
    };
    Templates.toggleMEItem = function (template,item) {
        item.on = !item.on;
    };
    Templates.toggleSDItem = function (template, item) {
        item.on = !item.on;
    };
    Templates.toggleSEItem = function (template, item) {
        item.on = !item.on;
    };
    Templates.addNewTemplate = function () {
        var name = $filter("translate")('Full template');
        Templates.templates.push (Templates.createNewTemplate (name + '_' + Templates.templates.length));
    };
    Templates.removeTemplate = function (template) {
        var index = Templates.templates.indexOf (template);
        Templates.templates.splice(index, 1);
        if (Templates.templates.length === 0) {
            var name = $filter("translate")('Full template');
            Templates.templates.push (Templates.createNewTemplate (name));
        }
    };
    return Templates;
}]);