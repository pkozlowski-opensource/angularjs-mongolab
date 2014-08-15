var gulp = require('gulp');
var jshint = require('gulp-jshint');
var karma = require('karma').server;

var PATHS = {
  src: 'src/**/*.js',
  test: 'test/**/*.spec.js'
};


var karmaCommonConf = {
  browsers: process.env.TRAVIS ? ['Firefox'] : ['Chrome'],
  frameworks: ['jasmine'],
  files: [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    PATHS.src, PATHS.test
  ],
  singleRun: true,
  reporters: ['dots']
};

gulp.task('lint', function () {
  gulp.src([PATHS.src, PATHS.test])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('tdd', function (done) {
  karmaCommonConf.singleRun = false;
  karma.start(karmaCommonConf, done);
});

gulp.task('test', function (done) {
  karma.start(karmaCommonConf, done);
});

gulp.task('default', ['lint', 'test']);
