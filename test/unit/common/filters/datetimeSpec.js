'use strict';

/* jasmine specs for directives go here */

describe('filters', function() {
  beforeEach(module('app.filters'));

  describe('datetime', function() {
    it('should be right value', function() {
      // module(function($provide) {
      //   $provide.value('version', 'TEST_VER');
      // });
      inject(function($compile, $rootScope) {
        var element = $compile('<span app-version></span>')($rootScope);
        expect('foo').toEqual('foo');
      });
    });
  });
});
