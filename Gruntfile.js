'use strict';

module.exports = function (grunt) {
  // show elapsed time at the end
  require('time-grunt')(grunt);
  // load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    
    
    // Watch Config
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      module: {
        files: ['<%= jshint.module.src %>'],
        tasks: ['jshint:module']
      },
      coffee: {
        files: ['<%= jshint.coffee.src %>'],
        tasks: ['coffee:glob_to_multiple']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'nodeunit']
      }
    },



    // coffeescript processing settings
    coffee: {
      glob_to_multiple: {    
        options: {
          bare: true
        },
        expand: true,
        cwd: 'src/',
        src: ['**/*.coffee'],
        dest: '',
        ext: '.js'
      }
    },
    



    // Hint Config
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      module: {
        src: ['index.js']
      },
      coffee: {
        src: ['src/**/*.coffee']
      },
      test: {
        src: ['test/**/*.js']
      }
    }

  });

  // Register Tasks
  // Workon
  grunt.registerTask('default', 'Start working on this project.', [
    'watch'
  ]);

  // Restart
  grunt.registerTask('init', 'first, compile coffeescript, then watch', [
    'coffee:glob_to_multiple',
    'watch'
  ]);
};
