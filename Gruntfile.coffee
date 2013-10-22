lrSnippet = require("grunt-contrib-livereload/lib/utils").livereloadSnippet
mountFolder = (connect, dir) ->
  connect.static require("path").resolve(dir)

config:
  locales: ["ru", "en", "ua", "pl"]

module.exports = (grunt) ->
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
          angular: "v1.2.0-rc.2"
          "angular-route": "v1.2.0-rc.2"
          "angular-resource": "v1.2.0-rc.2"
          "angular-animate": "v1.2.0-rc.2"
          "angular-ui-sortable": ""
          "angular-ui-bootstrap": ""  # Search for 3.0 tag/branch
          # "https://raw.github.com/angular-ui/ui-utils/master/modules/ie-shiv/ie-shiv.js": ""
          #   name: "some-lib"
          # "some-lib": "https://raw.github.com/angular-ui/ui-utils/master/modules/ie-shiv/ie-shiv.js"
          # name:
          "angular-translate": ""
          # "bootstrap-datepicker": ""  # Не совместим с bootstrap 3.x
          "bootstrap3-datepicker": ""   # Форк предыдущего с поддерхкой twbs3
          # "angular-strap": ""       # Не совместим с bootstrap 3.x
          # "angular-virtual-scroll": ""    # Сомнительная производительность
          # ngInfiniteScroll: ""
          # "https://github.com/tcard/ngInfiniteScroll.git": ""
          "https://github.com/baden/ngInfiniteScroll.git": "1.0.1-pre1"
          # "ngInfiniteScroll": "https://github.com/baden/ngInfiniteScroll.git" # Оригинальный не поддерживает скроллинг в контейнере, только в top
          "angular-bindonce": ""
          "components-font-awesome": ""
          moment:
            select: ["moment.js", "ru.js"]
          jszip:
            select: [ 'jszip.js', 'jszip-deflate.js' ]
          "https://github.com/stephen-hardy/xlsx.js.git": ""
          # "sockjs-client": ""

          # Для поддержки старых браузеров. Проверить это вообще помогает?
          "angular-ui-utils": ""
          "es5-shim": ""
          json3: ""
        store: 'components'
        # dest: 'public'

    # CoffeeScript
    coffee:
      dist:
        files:
          "<%= distdir %>/js/*.js": ["src/coffee/**/*.coffee"]
      test:
        files:
          "test/spec/*.js": ["test/spec/coffee/**/*.coffee"]

    less:
      dist:
        files:
          "<%= distdir %>/css/<%= pkg.name %>.css": ["<%= src.less %>"]

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
          src: ['xlsx.js/xlsx.js','jszip/*.js','jquery/jquery.js','jquery-ui/ui/jquery.ui.core.js','jquery-ui/ui/jquery.ui.widget.js','jquery-ui/ui/jquery.ui.mouse.js','jquery-ui/ui/jquery.ui.sortable.js','bootstrap/dist/js/bootstrap.js','bootstrap-datepicker/js/bootstrap-datepicker.js','bootstrap-datepicker/js/locales/bootstrap-datepicker.ru.js','angular/angular.js','angular-route/angular-route.js','angular-resource/angular-resource.js','angular-animate/angular-animate.js','angular-translate/angular-translate.js','angular-ui-sortable/src/sortable.js','angular-ui-bootstrap/src/buttons/buttons.js','angular-bindonce/bindonce.js','ngInfiniteScroll/build/ng-infinite-scroll.js','moment/moment.js','moment/lang/*.js','d3/d3.js','components-font-awesome/css/font-awesome.min.css','bootstrap/dist/css/bootstrap.min.css','components-font-awesome/font/*.*']
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
        src:[
          '<banner:meta.banner>'
          'src/i18n/**/*.js'
          'src/common/**/*.js'
          'src/app/**/*.js'
          'temp/templates-jade.js'
          'temp/templates.js'
        ],
        dest:'<%= distdir %>/js/<%= pkg.name %>.js'
      conponents_min:
        files: [
          src: [
            'components/xlsx.js/xlsx.js',
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
            'components/angular/angular.min.js',
            'components/angular-route/angular-route.min.js',
            'components/angular-resource/angular-resource.min.js',
            'components/angular-animate/angular-animate.min.js',
            'components/angular-translate/angular-translate.min.js',
            'components/angular-ui-sortable/src/sortable.js',
            'components/angular-ui-bootstrap/src/buttons/buttons.js',
            'components/angular-bindonce/bindonce.js',
            'components/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
            'components/moment/moment.js',
            'components/moment/lang/ru.js',
            # 'components/moment/lang/uk.js',
            # 'components/moment/lang/pl.js',
            'components/d3/d3.min.js'
          ]
          dest: '<%= distdir %>/js/components.js'
          # expand: true
        ,
          src: [
            'components/bootstrap/dist/css/bootstrap.min.css'
            'components/components-font-awesome/css/font-awesome.min.css'
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
          network: ['http://*', 'https://*', '*']
          fallback: ['/ /offline.html']
          # exclude: ['js/jquery.min.js']
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
        tasks: ['copy:templates']
      js:
        files: ['src/i18n/**/*.js', 'src/common/**/*.js', 'src/app/**/*.js']
        tasks: ['concat']
      template:
        files: ['<%= distdir %>/templates/**/*.tpl.html']
        tasks: ['html2js', 'concat']
      livereload:
        files: ['<%= distdir %>/**']
        tasks: ['livereload']
      jade:
        # files: ['src/app/templates/*.jade']
        files: ['src/app/**/*.jade']
        tasks: ['jade', 'html2js', 'concat']
      less:
        files: ['src/less/*.less']
        tasks: ['less']


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

  # grunt-contrib-watch now not work with livereload :(
  #grunt.loadNpmTasks "grunt-contrib-watch"

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
    "clean", "jade", "less", "bowerful", "copy", "index", "concat"
  ]

  # Production
  grunt.registerTask "production", [
    # "clean", "jade", "less" #, "bowerful", "copy", "index", "concat"
    "clean"
    "jade:production"
    "ngtemplates:production"
    "ngtemplates:production_jade"
    "less"
    # "bowerful"
    "copy:assets"
    "copy:sprites"
    "copy:conponents_min"
    "concat:conponents_min"
    "concat:production"
    "uglify:production"
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


  grunt.registerTask "default", ["pruduction"]
