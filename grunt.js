module.exports = function (grunt) {

  grunt.loadNpmTasks('grunt-recess');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadTasks('build');

  // Project configuration.
  grunt.initConfig({
    distdir: 'dist',
    pkg:'<json:package.json>',
    meta:{
      banner:'/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    src: {
      js: ['src/**/*.js', 'dist/tmp/**/*.js'],
      html: ['src/index.html'],
      tpl: ['src/app/**/*.tpl.html'],
      less: ['src/less/stylesheet.less'] // recess:build doesn't accept ** in its file patterns
    },
    clean: ['<%= distdir %>/*'],
    copy: {
      assets: {
        files: {'<%= distdir %>/': 'src/assets/**'}
      }
    },
    test: {
      unit: ['test/unit/**/*Spec.js'],
      e2e: ['test/e2e/**/*Scenario.js']
    },
    lint:{
      files:['grunt.js', '<config:src.js>', '<config:test.unit>', '<config:test.e2e>']
    },
    html2js: {
      src: ['<config:src.tpl>'],
      base: 'src/app',
      dest: 'dist/tmp'
    },
    concat:{
      dist:{
        src:['<banner:meta.banner>', '<config:src.js>'],
        dest:'<%= distdir %>/js/<%= pkg.name %>.js'
      },
      angular: {
        src:['vendor/angular/angular.js', 'vendor/angular/angular-ui.js'],
        dest: '<%= distdir %>/js/angular.js'
      },
      bootstrap: {
        src:['vendor/bootstrap/*.js', 'vendor/bootstrap/locales/*.js'],
        dest: '<%= distdir %>/js/bootstrap.js'
      },
      jquery: {
        /*src:['vendor/jquery/jquery-1.7.2.js', 'vendor/jquery/jquery-ui.min.js', 'vendor/jquery/jquery.ui.datepicker-ru.js'],*/
        src:['vendor/jquery/jquery-1.8.3.js', 'vendor/jquery/jquery-ui-1.9.2.custom.js'],
        /*src:['vendor/jquery/jquery-1.7.2.js'],*/
        dest: '<%= distdir %>/js/jquery.js'
      },
      moment: {
        src:['vendor/moment/moment.min.js', 'vendor/moment/ru.js'],
        dest: '<%= distdir %>/js/moment.js'
      },
      sockjs: {
        src:['vendor/sockjs/sockjs-0.3.min.js'],
        dest: '<%= distdir %>/js/sockjs.js'
      }
    },
    min: {
      dist:{
        src:['<banner:meta.banner>', '<config:src.js>'],
        dest:'<%= distdir %>/js/<%= pkg.name %>.js'
      },
      angular: {
        src:['<config:concat.angular.src>'],
        dest: '<%= distdir %>/js/angular.js'
      },
      bootstrap: {
        src:['<config:concat.bootstrap.src>'],
        dest: '<%= distdir %>/js/bootstrap.js'
      },
      jquery: {
        src:['<config:concat.jquery.src>'],
        dest: '<%= distdir %>/js/jquery.js'
      },
      moment: {
        src:['<config:concat.moment.src>'],
        dest: '<%= distdir %>/js/moment.js'
      },
      sockjs: {
        src:['<config:concat.sockjs.src>'],
        dest: '<%= distdir %>/js/sockjs.js'
      }
    },
    recess: {
      build: {
        src: ['<config:src.less>'],
        dest: '<%= distdir %>/css/<%= pkg.name %>.css',
        options: {
          compile: true
        }
      },
      min: {
        src: ['<config:src.less>'],
        dest: '<config:recess.build.dest>',
        options: {
          compress: true
        }
      }
    },
    watch:{
      //files:['<config:src.js>', '<config:test.unit>', '<config:src.less>', '<config:src.tpl>', '<config:src.html>'],
      files:['<config:src.js>', '<config:src.less>', '<config:src.tpl>', '<config:src.html>', 'src/less/main.less'],
      tasks:'default timestamp'
    },
    jshint:{
      options:{
        curly:true,
        eqeqeq:true,
        immed:true,
        latedef:true,
        newcap:true,
        noarg:true,
        sub:true,
        boss:true,
        eqnull:true
      },
      globals:{}
    },
    uglify:{}
  });

  // Default task.
  //grunt.registerTask('default', 'lint build test:unit');
  grunt.registerTask('default', 'lint build');
  grunt.registerTask('build', 'clean html2js concat recess:build index copy');
  grunt.registerTask('release', 'clean html2js min lint test recess:min index copy e2e');

  // HTML stuff
  grunt.registerTask('index', 'Process index.html', function(){
     grunt.file.copy('src/index.html', 'dist/index.html', {process:grunt.template.process});
  });

  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });

};