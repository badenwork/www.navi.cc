'use strict';

/* jasmine specs for directives go here */

describe('filters', function() {
  beforeEach(module('app.filters'));

  describe('datetime', function() {
    it('should be right value', function() {
      // module(function($provide) {
      //   $provide.value('version', 'TEST_VER');
      // });
      inject(function($compile, $rootScope, $filter) {
        var datetime = $filter('datetime')
        // var element = $compile('<span>{{ 0 | datetime }}</span>')($rootScope);

        var a = moment(new Date(0));
        var expected = a.format("DD/MM/YYYY HH:mm:ss");
<<<<<<< HEAD
        console.log('expected', expected);
=======
>>>>>>> d901c458d6840e0f5ed2d16201e1e61b63b22bc0

        expect(datetime(0)).toEqual(expected);
      });
    });
  });
});
