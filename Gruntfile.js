'use strict';

module.exports = function(grunt) {

  var packageName = grunt.option("p") || null;
  var packageStandardName = null;
  if (packageName)
  {
    packageStandardName = packageName.split(".");
    packageStandardName = packageStandardName[0] + "." + packageStandardName[1] + "." + (packageStandardName[2] ? packageStandardName[2] : "default");
  }

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('demand.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    packageName: packageName,
    footer: ';demand.demandObject.loaded("<%= packageStandardName %>");',
    packageStandardName: packageStandardName,
    // Task configuration.
    clean: {
      before: {
        src: ['dist/<%= pkg.name %>.js', 'dist/<%= pkg.name %>.min.js']
      },
      after: {
        src: ['build', "src/.build"]
      },
      beforePck: {
        src: ['dist/packages/<%= packageStandardName %>', 'dist/packages/<%= packageStandardName %>.js']
      },
      afterPck: {
        src: ["build"]
      },
      nolint: {
        src: ['src/packages/<%= packageStandardName %>/<%= packageStandardName %>.js']
      }
    },
    'string-replace': {
      normal: {
        files: [{
          expand: true,
          src: 'demand.js',
          dest: 'src/.build',
          cwd: './src'
        }],
        options: {
          replacements: [{
            pattern: '{language}',
            replacement: grunt.option("language") || "en-GB"
          }]
        }
      },
      package: {

      }
    },
    includes: {
      normal: {
        options: {
          includeRegexp: /^\/\/\@\s*import\s+['"]?([^'"]+)['"]?\s*$/,
          duplicates: false
        },
        files: [{
          src: '.build/demand.js',
          dest: 'build/',
          cwd: './src'
        }]
      },
      package: {
        options: {
          includeRegexp: /^\/\/\@\s*import\s+['"]?([^'"]+)['"]?\s*$/,
          duplicates: false
        },
        files: [{
          src: 'packages/<%= packageStandardName %>/<%= packageStandardName %>.js',
          dest: 'build/',
          cwd: './src'
        }]
      }
    },
    concat: {
      normal: {
        options: {
          banner: '<%= banner %>',
          stripBanners: true
        },
        src: ['build/.build/<%= pkg.name %>.js'],
        dest: 'dist/<%= pkg.name %>.js'
      },
      package: {
        options: {
          footer: '<%= footer %>',
          stripBanners: true
        },
        src: ['build/packages/<%= packageStandardName %>/<%= packageStandardName %>.js'],
        dest: 'dist/packages/<%= packageStandardName %>.js'
      }
    },
    uglify: {
      normal: {
        /*options: {
          banner: '<%= banner %>'
        },*/
        src: '<%= concat.normal.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      package: {
        options: {
          banner: '<%= banner %>'
        },
        src: '<%= concat.package.dest %>',
        dest: 'dist/packages/<%= packageStandardName %>.js'
      }
    },
    copy: {
      normal: {
        src: "dist/<%= pkg.name %>.min.js",
        dest: "e:/xampp/htdocs/themes/wp-content/themes/festivity/js/<%= pkg.name %>.js"
      },
      nolint: {
        src: "src/packages/<%= packageStandardName %>/<%= packageStandardName %>.nolint.js",
        dest: "src/packages/<%= packageStandardName %>/<%= packageStandardName %>.js"
      }
    },
    lineremover: {
      normal: {
        files: {
          "build/<%= pkg.name %>.js": "build/<%= pkg.name %>.js"
        },
        options: {
          exclusionPattern: /^\s*console\..*$/g
        }
      },
      package: {

      }
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      normal: {
        options: {
            jshintrc: 'src/.jshintrc'
          },
          src: ['src/**/*.js', '!src/packages/**/*.js']
      },
      package: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/packages/<%= packageStandardName %>/**/*.js', '!src/packages/<%= packageStandardName %>/<%= packageStandardName %>.nolint.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>'
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-line-remover');
  grunt.loadNpmTasks('grunt-string-replace');

  // Default task.
  grunt.registerTask('default', ['jshint', 'clean:before', 'string-replace', 'includes', 'lineremover', 'concat', 'uglify', 'copy', 'clean:after']);
  // Debug task
  grunt.registerTask('debug', ['jshint:normal', 'clean:before', 'string-replace:normal', 'includes:normal', 'concat:normal', 'uglify:normal', 'copy:normal', 'clean:after']);
  // Task for building packages
  if (grunt.file.exists("src/packages/" + packageStandardName + "/" + packageStandardName + ".nolint.js"))
  {
    grunt.registerTask('package', ['jshint:package', 'clean:beforePck', 'copy:nolint', 'includes:package', 'concat:package', 'uglify:package', 'clean:afterPck', 'clean:nolint']);
  }
  else
  {
    grunt.registerTask('package', ['jshint:package', 'clean:beforePck', 'includes:package', 'concat:package', 'uglify:package', 'clean:afterPck']);
  }
};
