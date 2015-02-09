'use strict';

module.exports = function(grunt) {

  var packageName = grunt.option("p") || null;
  var packageStandardName = null;
  var noLint = false, hasAssets = false, needsUglify = false, packagePkg = null;
  if (packageName)
  {
    packageStandardName = packageName.split(".");
    packageStandardName = packageStandardName[0] + "." + packageStandardName[1] + "." + (packageStandardName[2] ? packageStandardName[2] : "default");
    hasAssets = grunt.file.isDir("src/packages/" + packageStandardName + "/.assets");
    packagePkg = grunt.file.readJSON('src/packages/' + packageStandardName + '/' + packageStandardName + '.json');
    needsUglify = !packagePkg.noUglify;
    noLint = packagePkg.noLint || false;
  }

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('demand.json'),
    packagePkg: packageName ? packagePkg : {},
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    bannerPackage: '/*! <%= pkg.title || pkg.name %> Package File: <%= packagePkg.title %> (<%= packagePkg.name %>) - v<%= packagePkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= packagePkg.homepage ? "* " + packagePkg.homepage : "" %>' +
      '<%= !packagePkg.noCopyright ? "\\n* Copyright (c) " + grunt.template.today("yyyy") + " " + packagePkg.author.name + ";" : "" %>' +
      '<%= !packagePkg.noCopyright ? " Licensed " + _.pluck(packagePkg.licenses, "type").join(", ")  : "" %> */\n',
    packageName: packageName,
    footer: 'demand.demandObject.loaded("<%= packageStandardName %>");',
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
          src: '.build/<%= pkg.name %>.js',
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
          banner: needsUglify ? '' : '<%= bannerPackage %>',
          footer: '<%= footer %>',
        },
        src: 'build/packages/<%= packageStandardName %>/<%= packageStandardName %>.js',
        dest: 'dist/packages/<%= packageStandardName %>.js'
      }
    },
    uglify: {
      normal: {
        options: {
          banner: '<%= banner %>'
        },
        src: '<%= concat.normal.dest %>',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      package: {
        options: {
          banner: '<%= bannerPackage %>',
        },
        src: '<%= concat.package.dest %>',
        dest: '<%= concat.package.dest %>'
      }
    },
    copy: {
      /*normal: {
        src: "dist/<%= pkg.name %>.min.js",
        dest: "/path/to/final.js"
      },*/
      pckassets: {
        expand: true,
        cwd: "src/packages/<%= packageStandardName %>/.assets",
        src: "**/*",
        dest: "dist/packages/<%= packageStandardName %>"
      }
    },
    lineremover: {
      normal: {
        files: {
          "build/.build/<%= pkg.name %>.js": "build/.build/<%= pkg.name %>.js"
        },
        options: {
          exclusionPattern: /^\s*console\..*$/g
        }
      },
      package: {
        files: {
          "build/<%= packageStandardName %>.js": "build/<%= packageStandardName %>.js"
        },
        options: {
          exclusionPattern: /^\s*console\..*$/g
        }
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
        src: noLint ? ['src/packages/<%= packageStandardName %>/**/*.js', '!src/packages/<%= packageStandardName %>/<%= packageStandardName %>.js'] : ['src/packages/<%= packageStandardName %>/**/*.js']
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
  grunt.registerTask('default', ['jshint:normal', 'clean:before', 'string-replace:normal', 'includes:normal', 'lineremover:normal', 'concat:normal', 'uglify:normal',/* 'copy:normal',*/ 'clean:after']);
  // Debug task
  grunt.registerTask('debug', ['jshint:normal', 'clean:before', 'string-replace:normal', 'includes:normal', 'concat:normal', 'uglify:normal',/* 'copy:normal',*/ 'clean:after']);
  // Task for building packages
  var packageTasks = [];
  packageTasks.push("jshint:package");
  packageTasks.push("clean:beforePck");
  packageTasks.push("includes:package");
  packageTasks.push("concat:package");
  if (needsUglify)
  {
    packageTasks.push("uglify:package");
  }
  packageTasks.push("clean:afterPck");
  if (hasAssets)
  {
    packageTasks.push("copy:pckassets");
  }
  grunt.registerTask('package', packageTasks);

};
