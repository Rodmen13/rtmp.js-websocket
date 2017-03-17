module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ts: {
      default : {
        src: ['src/**/*.ts'],
        out: 'build/ts/rtmp.js',
        reference: 'src/references.ts',
        options: {
          target: 'ES6',
          fast: 'never'
        }
      }
    },
    web_server: {
      options: {
        cors: true,
        port: 8000,
        nevercache: true,
        logRequests: true
      },
      foo: 'bar'
    }
  });

  grunt.loadNpmTasks('grunt-ts');
  grunt.loadNpmTasks('grunt-web-server');

  grunt.registerTask('ensureBuildDirectory', function () {
    grunt.file.mkdir('build/ts');
  });

  grunt.registerTask('default', ['ensureBuildDirectory', 'ts']);
};
