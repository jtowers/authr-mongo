var gulp = require('gulp');
var watch = require('gulp-watch');
var exec = require('child_process').exec;
var mocha = require('gulp-mocha');



gulp.task('jsdoc', function(){
  gulp.src('*.js')
  .pipe(watch(function(files){
    return exec('./node_modules/.bin/jsdoc index.js -d doc -t ./node_modules/ink-docstrap/template -c ./node_modules/ink-docstrap/template/jsdoc.conf.json README.md', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
  });
  }));
});

gulp.task('tests', function (cb) {
    gulp.src('test/*.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
  cb();
});



gulp.task('build', ['tests', 'jsdoc']);




