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
          src: ['**']
          cwd: 'components/'
          expand: true
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

    clean:
      dist: ['<%= distdir %>/*']
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

  # Development server
  grunt.registerTask 'server', [
    'build',
    'livereload-start',
    'connect:livereload',
    #'connect',
    'regarde'
    #'open',
    #'watch'
  ]


  grunt.registerTask "default", ["build"]
