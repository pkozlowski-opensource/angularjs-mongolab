var gulp = require('gulp');
var karma = require('karma').server;

function karmaExit(exitCode) {
  process.exit(exitCode);
}

var karmaCommonConf = {
  browsers: process.env.TRAVIS ? ['Firefox']: ['Chrome'],
  frameworks: ['jasmine'],
  files: [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'src/**/*.js',
    'test/**/*.js'
  ],
  singleRun: true
};

gulp.task('test', function () {
  karma.start(karmaCommonConf, karmaExit);
});