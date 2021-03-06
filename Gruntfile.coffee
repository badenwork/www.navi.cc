lrSnippet = require("grunt-contrib-livereload/lib/utils").livereloadSnippet
mountFolder = (connect, dir) ->
  connect.static require("path").resolve(dir)

config:
  locales: ["ru", "en", "ua", "pl"]

module.exports = (grunt) ->


  karmaConfig = (configFile, customOptions) ->
    options =
      configFile: configFile
      # keepalive: true
      singleRun: true

    travisOptions = process.env.TRAVIS and
      browsers: ["Firefox", "PhantomJS"]
      reporters: "dots"

    grunt.util._.extend options, customOptions, travisOptions

  # Project configuration.
  grunt.initConfig
    meta: grunt.file.readJSON('package.json')
    pkg: grunt.file.readJSON('package.json')
    distdir: 'dist'
    tempdir: 'temp'

    # Paths
    src:
      js: ['src/i18n/**/*.js', 'src/common/**/*.js', 'src/app/**/*.js', 'dist/tmp/**/*.js']
      html: ['src/index.html']
      tpl: ['src/app/**/*.tpl.html']
      #css: ['src/css']
      #less: ['src/less/*.less']  # recess:build doesn't accept ** in its file patterns
      less: ['src/less/main.less']  # recess:build doesn't accept ** in its file patterns

    ngtemplates:
      components:
        cwd:    'components/angular-ui-bootstrap'
        src:    ["template/datepicker/*.html"]
        dest:   'temp/templates-components.js'
        options:
          module: 'app'
          prefix: ''
          # url:    (url) -> return 'templates/' + url  # .replace '.tpl.html', '.html'
          htmlmin:
            collapseBooleanAttributes:      false
            collapseWhitespace:             true
            removeAttributeQuotes:          false
            removeComments:                 true # Only if you don't use comment directives!
            removeEmptyAttributes:          false
            removeRedundantAttributes:      false
            removeScriptTypeAttributes:     false
            removeStyleLinkTypeAttributes:  false

      production:
        cwd:    'src/app'
        src:    ["**/*.tpl.html"]
        dest:   'temp/templates.js'
        # expand: true
        options:
          module: 'app'
          prefix: 'templates/'
          # url:    (url) -> return 'templates/' + url  # .replace '.tpl.html', '.html'
          htmlmin:
            collapseBooleanAttributes:      false
            collapseWhitespace:             true
            removeAttributeQuotes:          false
            removeComments:                 true # Only if you don't use comment directives!
            removeEmptyAttributes:          false
            removeRedundantAttributes:      false
            removeScriptTypeAttributes:     false
            removeStyleLinkTypeAttributes:  false

      production_jade:
        cwd:    'temp/templates'
        src:    ["**/*.tpl.html"]
        dest:   'temp/templates-jade.js'
        # expand: true
        options:
          module: 'app'
          prefix: 'templates/'
          # url:    (url) -> return 'templates/' + url  # .replace '.tpl.html', '.html'
          htmlmin:
            collapseBooleanAttributes:      false
            collapseWhitespace:             true
            removeAttributeQuotes:          false
            removeComments:                 true # Only if you don't use comment directives!
            removeEmptyAttributes:          false
            removeRedundantAttributes:      false
            removeScriptTypeAttributes:     false
            removeStyleLinkTypeAttributes:  false

    bowerful:
      dist:
        packages:
          bootstrap: "~3.0"
          # jquery: ""  # TODO: Test with v2
          jquery: "~1"
          "jquery-ui": ""
          d3: ""
          # angular: ""
          # "angular-unstable": "~1.2.0-rc2"
          angular: "v1.2.0"
          "angular-route": "v1.2.0"
          "angular-resource": "v1.2.0"
          "angular-animate": "v1.2.0"
          "angular-ui-sortable": ""
          "angular-ui-bootstrap": ""  # Search for 3.0 tag/branch
          "angular-ui-select2": ""
          # "https://raw.github.com/angular-ui/ui-utils/master/modules/ie-shiv/ie-shiv.js": ""
          #   name: "some-lib"
          # "some-lib": "https://raw.github.com/angular-ui/ui-utils/master/modules/ie-shiv/ie-shiv.js"
          # name:
          "angular-translate": ""
          # "bootstrap-datepicker": ""  # Не совместим с bootstrap 3.x
          "bootstrap3-datepicker": ""   # Форк предыдущего с поддерхкой twbs3
          "bootstrap-daterangepicker": ""
          # "angular-strap": ""       # Не совместим с bootstrap 3.x
          # "angular-virtual-scroll": ""    # Сомнительная производительность
          # ngInfiniteScroll: ""
          # "https://github.com/tcard/ngInfiniteScroll.git": ""
          "https://github.com/baden/ngInfiniteScroll.git": "1.0.1-pre1"
          # "ngInfiniteScroll": "https://github.com/baden/ngInfiniteScroll.git" # Оригинальный не поддерживает скроллинг в контейнере, только в top
          "angular-bindonce": ""
          "components-font-awesome": "3.2.1"
          "moment": "2.4.0"
          # moment:
          #   select: ["moment.js", "ru.js"]
          # jszip:
          #   select: [ 'jszip.js', 'jszip-deflate.js' ]
          "https://github.com/MrRio/jsPDF.git": ""
          "https://github.com/stephen-hardy/xlsx.js.git": ""
          "https://github.com/Stuk/jszip.git": ""
          # "sockjs-client": ""

          # Для поддержки старых браузеров. Проверить это вообще помогает?
          "angular-ui-utils": ""
          "es5-shim": ""

          # Средства тестирования
          "angular-mocks": ""
          json3: ""
        store: 'components'
        # dest: 'public'

    jshint:
      all: ["<%= src.js %>"]

    # CoffeeScript
    coffee:
      dist:
        files:
          "<%= distdir %>/js/*.js": ["src/coffee/**/*.coffee"]
      test:
        files:
          "test/spec/*.js": ["test/spec/coffee/**/*.coffee"]


    replace:
      bootstrap:
        src: ["components/bootstrap/less/variables.less"] # source files array (supports minimatch)
        dest: "temp/components/bootstrap/" # destination directory or file
        replacements: [
          from: "1200px;"
          to:   "1001px;"
        ,
          from: "1140px"
          to:   "940px"
        ]

    less:
      dist:
        files:
          "<%= distdir %>/css/<%= pkg.name %>.css": ["<%= src.less %>"]
      bootstrap:
        files:
          "temp/components/bootstrap.css": ["temp/components/bootstrap/bootstrap.less"]

    copy:
      assets:
        files: [
          dest: '<%= distdir %>/'
          src: ['**']
          cwd: 'src/assets/'
          expand: true
        ]
      conponents:
        files: [
          dest: '<%= distdir %>/components'
          src: ['xlsx.js/xlsx.js','jsPDF/dist/jspdf.min.js','jszip/*.js','jquery/jquery.js','jquery-ui/ui/jquery.ui.core.js','jquery-ui/ui/jquery.ui.widget.js','jquery-ui/ui/jquery.ui.mouse.js','jquery-ui/ui/jquery.ui.sortable.js','bootstrap/dist/js/bootstrap.js','bootstrap-datepicker/js/bootstrap-datepicker.js','bootstrap-datepicker/js/locales/bootstrap-datepicker.ru.js','angular/angular.js','angular-route/angular-route.js','angular-resource/angular-resource.js','angular-animate/angular-animate.js','angular-translate/angular-translate.js','angular-ui-sortable/src/sortable.js','angular-ui-bootstrap/src/buttons/buttons.js','angular-bindonce/bindonce.js','ngInfiniteScroll/build/ng-infinite-scroll.js','moment/moment.js','moment/lang/*.js','d3/d3.js','components-font-awesome/css/font-awesome.min.css','bootstrap/dist/css/bootstrap.min.css','components-font-awesome/font/*.*','bootstrap-timepicker/js/bootstrap-timepicker.min.js','bootstrap-timepicker/css/bootstrap-timepicker.min.css']
          cwd: 'components/'
          expand: true
        ]
      conponents_min:
        files: [
        #   dest: '<%= distdir %>/css/'
        #   src: [
        #     'components/components-font-awesome/css/font-awesome.min.css',
        #     'components/bootstrap/dist/css/bootstrap.min.css',
        #   ]
        #   expand: true
        #   flatten: true
        # ,
          dest: '<%= distdir %>/font/'
          src: 'components/components-font-awesome/font/*'
          expand: true
          flatten: true
        ]
      templates:
        files: [
          dest: '<%= distdir %>/templates'
          src: ['**/*.tpl.html']
          cwd: 'src/app'
          expand: true
        ]
      sprites:
        files: [
          src: ["sprite-marker.png"]
          dest: "dist/css/"
          cwd: 'src/images'
          expand: true
        ]
      bootstrap:
        files: [
          src: ["*.less", '!variables.less']
          cwd: "components/bootstrap/less/"
          dest: "temp/components/bootstrap/"
          expand: true
        ]
      bootstrap3:
        files: [
          src: ["*.less", '!variables.less']
          cwd: "components/bootstrap/less/"
          dest: "temp/components/bootstrap/"
          expand: true
        ,
          src: ["src/less/variables.less"]
          dest: "temp/components/bootstrap/"
          expand: true
          flatten: true
        ]

    jade:
      templates:
        options:
          client: false
          # pretty: false
          doctype: '5'
          pretty: true
          data:
            debug: false
            title: 'My awesome application'
          # extension: '.tpl.html'
          # locals:
          #   _: grunt.file.readJSON('src/i18n/ru.json')
        # files: grunt.file.expandMapping(["**/*.jade"], "dist/templates/",
        files: grunt.file.expandMapping(["**/*.jade"], "dist/templates/",
          # cwd: "src/app/templates"
          cwd: "src/app"
          rename: (destBase, destPath) ->
            # console.log "Hello", destBase, destPath
            destBase + destPath.replace(/\.jade$/, ".tpl.html")
          # '<%= tempdir %>/templates': ['src/app/templates/*.jade']
          # '<%= distdir %>/templates/': ['src/app/templates/*.jade']
          )

      production:
        options:
          client: false
          doctype: '5'
          pretty: true
          data:
            debug: false
            title: 'My awesome application'
        files: grunt.file.expandMapping(["**/*.jade"], "temp/templates/",
          cwd: "src/app"
          rename: (destBase, destPath) ->
            destBase + destPath.replace(/\.jade$/, ".tpl.html")
          )

    # jade:
    #   templates: {
    #     files: {
    #       'dist/templates/': ['src/app/templates*.jade']
    #     },
    #     options: {
    #       client: false,
    #       locals: {
    #         title: 'Welcome to my website!'
    #       }
    #     }
    #   }


    html2js:
      #templates:
      #  options:
      #    base: '<%= distdir %>/'
      #  src: ['<%= distdir %>/templates/**/*.tpl.html']
      #  dest: '<%= distdir %>/js/templates.js'
      #  module: 'templates'

      templates:
        options:
          base: '<%= distdir %>'
          module: 'templates'
        src: ['<%= distdir %>/templates/**/*.tpl.html']
        dest: '<%= distdir %>/js/templates.js'

    concat:
      dist:
        src:['<banner:meta.banner>', '<%= src.js %>'],
        dest:'<%= distdir %>/js/<%= pkg.name %>.js'
      #  src:['src/i18n/ru.jade', 'src/*.jade']
      #  dest:'<%= distdir %>/tmp/jade/*.jade'
      production:
        banner: "'use strict';\n"
        src:[
          '<banner:meta.banner>'
          'src/i18n/**/*.js'
          'src/common/**/*.js'
          'src/app/**/*.js'
          'temp/templates.js'
          'temp/templates-jade.js'
          # 'temp/templates-components.js'    # Некрасивый :(
        ],
        dest:'<%= distdir %>/js/<%= pkg.name %>.js'

      conponents:
        files: [
          src: [
            'components/xlsx.js/xlsx.js',
            'components/jsPDF/dist/jspdf.min.js',
            'components/jszip/jszip.min.js',
            'components/jszip/jszip-deflate.js',
            'components/jquery/jquery.min.js',
            'components/jquery-ui/ui/jquery.ui.core.js',
            'components/jquery-ui/ui/jquery.ui.widget.js',
            'components/jquery-ui/ui/jquery.ui.mouse.js',
            'components/jquery-ui/ui/jquery.ui.sortable.js',
            'components/bootstrap/dist/js/bootstrap.min.js',
            'components/bootstrap-datepicker/js/bootstrap-datepicker.js',
            'components/bootstrap-datepicker/js/locales/bootstrap-datepicker.ru.js',
            'components/bootstrap-datepicker/js/locales/bootstrap-datepicker.uk.js',
            'components/bootstrap-datepicker/js/locales/bootstrap-datepicker.pl.js',
            # 'components/bootstrap-daterangepicker/daterangepicker.js',
            'components/angular/angular.js',
            'components/angular-route/angular-route.min.js',
            'components/angular-resource/angular-resource.min.js',
            'components/angular-animate/angular-animate.min.js',
            'components/angular-translate/angular-translate.min.js',
            'components/angular-ui-sortable/src/sortable.js',
            'components/angular-ui-bootstrap/src/buttons/buttons.js',
            'components/angular-ui-bootstrap/src/position/position.js',     # Необходим для ui-datepicker
            'components/angular-ui-bootstrap/src/datepicker/datepicker.js',
            'components/angular-ui-select2/src/select2.js',
            'components/angular-bindonce/bindonce.js',
            'components/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
            'components/moment/moment.js',
            'components/moment/lang/ru.js',
            'components/moment/lang/uk.js',
            'components/moment/lang/pl.js',
            'components/bootstrap-timepicker/js/bootstrap-timepicker.js',
            'components/d3/d3.min.js'
          ]
          dest: '<%= distdir %>/js/components.js'
        ,
          src: [
            'components/bootstrap/dist/css/bootstrap.min.css'
            'components/bootstrap-timepicker/css/bootstrap-timepicker.css'
            'components/components-font-awesome/css/font-awesome.min.css'
            'components/bootstrap-datepicker/css/datepicker.css'
            # 'components/bootstrap-daterangepicker/daterangepicker-bs3.css'
          ]
          dest: '<%= distdir %>/css/components.css'
        ]

      conponents_min:             # Minified versions
        files: [
          src: [
            'components/xlsx.js/xlsx.js',
            'components/jsPDF/dist/jspdf.min.js',
            'components/jszip/jszip.js',
            'components/jszip/jszip-deflate.js',
            'components/jquery/jquery.min.js',
            'components/jquery-ui/ui/jquery.ui.core.js',
            'components/jquery-ui/ui/jquery.ui.widget.js',
            'components/jquery-ui/ui/jquery.ui.mouse.js',
            'components/jquery-ui/ui/jquery.ui.sortable.js',
            'components/bootstrap/dist/js/bootstrap.min.js',
            'components/bootstrap-datepicker/js/bootstrap-datepicker.js',
            'components/bootstrap-datepicker/js/locales/bootstrap-datepicker.ru.js',
            'components/bootstrap-datepicker/js/locales/bootstrap-datepicker.uk.js',
            'components/bootstrap-datepicker/js/locales/bootstrap-datepicker.pl.js',
            # 'components/bootstrap-daterangepicker/daterangepicker.js',
            'components/angular/angular.min.js',
            'components/angular-route/angular-route.min.js',
            'components/angular-resource/angular-resource.min.js',
            'components/angular-animate/angular-animate.min.js',
            'components/angular-translate/angular-translate.min.js',
            'components/angular-ui-sortable/src/sortable.js',
            'components/angular-ui-bootstrap/src/buttons/buttons.js',
            'components/angular-ui-bootstrap/src/position/position.js',     # Необходим для ui-datepicker
            'components/angular-ui-bootstrap/src/datepicker/datepicker.js',
            'components/angular-ui-select2/src/select2.js',
            'components/angular-bindonce/bindonce.js',
            'components/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
            'components/moment/moment.js',
            'components/moment/lang/ru.js',
            'components/moment/lang/uk.js',
            'components/moment/lang/pl.js',
            'components/bootstrap-timepicker/js/bootstrap-timepicker.min.js',
            'components/d3/d3.min.js'
          ]
          dest: '<%= distdir %>/js/components.js'
        ,
          src: [
            # 'components/bootstrap/dist/css/bootstrap.min.css'
            'components/bootstrap-timepicker/css/bootstrap-timepicker.min.css'
            # 'components/bootstrap/dist/css/bootstrap.min.css'
            'temp/components/bootstrap.css'
            'components/components-font-awesome/css/font-awesome.min.css'
            'components/bootstrap-datepicker/css/datepicker.css'
            # 'components/bootstrap-daterangepicker/daterangepicker-bs3.css'
          ]
          dest: '<%= distdir %>/css/components.css'
        ]

    uglify:
      production:
        files:
          '<%= distdir %>/js/<%= pkg.name %>.min.js': ['<%= distdir %>/js/<%= pkg.name %>.js']

    oversprite:
      all:
        # // List of sprites to create
        spritelist: [
          # // List of images to add to sprite
          src: ["src/images/*.png"]
          # // Address of target image
          # dest: "dist/css/sprite-marker.png"
          dest: "src/images/sprite-marker.png"
          # // OPTIONAL: Image placing algorithm: top-down, left-right, diagonal, alt-diagonal
          algorithm: "alt-diagonal"
          # // OPTIONAL: Rendering engine: auto, canvas, gm
          engine: "gm"
          # // OPTIONAL: Preferences for resulting image
          exportOpts:
            # // Image formst (buy default will try to use dest extension)
            format: "png"
            # // Quality of image (gm only)
            quality: 90
        # ,
        #   # // Second sprite config
        #   src: ["src/images/img2.jpg", "images/img3.gif"]
        #   dest: "dist/img/sprite-other.jpg"
        ]
        # // List of css to replace images
        csslist: [
          # // Source css file
          src:  "src/images/style-sprite.css"
          # src:  "style-sprite.css"
          # // Target css file, can be the same as source
          # dest: "src/images/sprite-marker.css"
          dest: "dist/css/sprite-marker.css"
          # // OPTIONAL: Normalization string. Will be added to css dir path, before paths in css.
          # // Use if you move the css and paths to images aren't resolving correctly now.
          # base: "../../../dist/css/images"
          # base: "../../../src/images/marker/"
          # base: "src"
          # base: "../dist/css/"
        # ,
        #   # // Second css config
        #   src: "style.ie.css"
        #   dest: "sprite.ie.css"
        ]

    manifest:
      generate:
        options:
          basePath: 'dist/'
          cache: [
            'js/components.js'
            'js/angular-strap-0.7.5.js'
            # 'font/fontawesome-webfont.woff'
            'img/minus_button.png'
            'img/plus_button.png'
            'font/fontawesome-webfont.woff?v=3.2.1'
            'font/font-webfont.woff'
            'font/caricons.woff?82948991'
          ]
          network: [
            '/'
            'http://*'
            'https://*'
            'http://dev.new.navi.cc/1.0/*'
            '*'
          ]
          # fallback: ['/ /offline.html']
          exclude: [
            'css/www-navi-cc.css'
          ]
          preferOnline: true
          verbose: true
          timestamp: true
          hash: true
          master: ['index.html']
        src: [
          # 'some_files/*.html'
          'js/*.min.js'
          'css/*.css'
        ]
        dest: 'dist/manifest.appcache'

    clean:
      dist: ['<%= distdir %>/*', 'temp/*']
      sprites: ["src/images/sprite-*.png", "src/images/sprite-*.css"]

    connect:
      livereload:
        options:
          port: 9001
          hostname: 'localhost'
          # hostname: '192.168.1.144'
          middleware: (connect) ->
            [
              lrSnippet,
              mountFolder(connect, 'dist')
              #mountFolder(connect, yeomanConfig.app)
            ]

    regarde:
      html:
        files: '<%= src.html %>'
        tasks: ['index']
      htmltemplate:
        files: ['src/app/**/*.tpl.html']
        tasks: ['ngtemplates:production', 'concat:production']
      js:
        files: ['src/i18n/**/*.js', 'src/common/**/*.js', 'src/app/**/*.js']
        tasks: ['concat:production']
      # template:
      #   files: ['<%= distdir %>/templates/**/*.tpl.html']
      #   tasks: ['html2js', 'concat:production']
      jade:
        # files: ['src/app/templates/*.jade']
        files: ['src/app/**/*.jade']
        tasks: ['jade:production', 'ngtemplates:production_jade', 'concat:production']
      less:
        files: ['src/less/*.less']
        tasks: ['less']
      livereload:
        files: ['<%= distdir %>/**']
        tasks: ['livereload']


    karma:
      start:
        start:
          configFile: 'test/karma.conf.js'
      unit:
        options: karmaConfig 'test/karma.conf.js'

      continuous:
        options: karmaConfig( "test/karma.conf.js",
          singleRun: true
        )
      watch:
        options: karmaConfig( "test/karma.conf.js",
          singleRun: false
          autoWatch: true
        )


  grunt.loadNpmTasks "grunt-contrib-coffee"
  grunt.loadNpmTasks "grunt-contrib-copy"
  grunt.loadNpmTasks "grunt-contrib-concat"
  grunt.loadNpmTasks "grunt-contrib-less"
  grunt.loadNpmTasks "grunt-contrib-clean"
  #grunt.loadNpmTasks "grunt-contrib-jade"
  # grunt.loadNpmTasks "grunt-jade"
  grunt.loadNpmTasks "grunt-contrib-jade"
  grunt.loadNpmTasks "grunt-html2js"
  grunt.loadNpmTasks "grunt-contrib-connect"
  grunt.loadNpmTasks "grunt-contrib-livereload"
  grunt.loadNpmTasks "grunt-regarde"
  grunt.loadNpmTasks "grunt-oversprite"
  grunt.loadNpmTasks "grunt-bowerful"
  grunt.loadNpmTasks "grunt-angular-templates"
  grunt.loadNpmTasks "grunt-contrib-htmlmin"
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks "grunt-manifest"
  grunt.loadNpmTasks "grunt-contrib-jshint"
  grunt.loadNpmTasks "grunt-karma"

  grunt.loadNpmTasks "grunt-text-replace"




  # grunt-contrib-watch now not work with livereload :(
  #grunt.loadNpmTasks "grunt-contrib-watch"

  # Print a timestamp (useful for when watching)
  grunt.registerTask "timestamp", () ->
    grunt.log.subhead Date()

  # HTML stuff
  grunt.registerTask 'index', 'Process index.html', ->
    grunt.file.copy 'src/index.html', 'dist/index.html',
      process: grunt.template.process

  # Sprites
  grunt.registerTask "sprites", [
    "oversprite", "copy:sprites", "clean:sprites"
  ]

  # Build
  grunt.registerTask "build", [
    # "clean", "jade", "less", "copy", "html2js", "index", "concat"
    "clean", "jade", "less:dist", "bowerful", "copy", "index", "concat"
  ]

  # Build components
  grunt.registerTask "deps", [
    "bowerful", "copy:bootstrap", "replace:bootstrap", "less:bootstrap"
  ]

  # Production
  grunt.registerTask "production", [
    # "clean", "jade", "less" #, "bowerful", "copy", "index", "concat"
    "clean"
    "jshint"
    "jade:production"
    "ngtemplates:components"
    "ngtemplates:production"
    "ngtemplates:production_jade"
    "less:dist"
    # "bowerful"
    "copy:assets"
    "copy:sprites"
    "copy:bootstrap"
    "replace:bootstrap"
    "less:bootstrap"
    "copy:conponents_min"
    "concat:conponents_min"
    # "concat:conponents"
    "concat:production"
    # "uglify:production"
    "index"
    "manifest"
  ]

  # Development server
  grunt.registerTask 'server', [
    # 'build',
    'production'
    'livereload-start'
    'connect:livereload'
    #'connect'
    'regarde'
    #'open',
    #'watch'
  ]

  grunt.registerTask "test", ["karma:continuous"]
  grunt.registerTask "test-watch", ["karma:watch"]
  grunt.registerTask "default", ["production", "karma:unit"]

