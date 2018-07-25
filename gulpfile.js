var gulp        = require('gulp');
var babel = require('gulp-babel');
var uglify = require('gulp-uglify');
var browserify  = require('browserify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');

var BABEL_CONFIG={
    compact:false,
    minified:false,
    presets: [
      ["env", {
        targets: {
          browsers: ["last 4 versions"],
          uglify:true
        }
      }]]};

var SRC = 'datum.js';
var DEST = './dist/';
var MAPS = './maps';
var ENTRY= ['./index.js'];

gulp.task('publish',function(cb){
  return runSequence(
    'bundle',
    'transpile'
  ,cb);
});

gulp.task('bundle', function () {
   return browserify({entries: [ENTRY], debug: true})
      .bundle()
      .pipe(source(SRC))
      .pipe(buffer())
      .pipe(sourcemaps.init())
      .pipe(sourcemaps.write(MAPS))
      .pipe(gulp.dest(DEST));
});

gulp.task('transpile',function(){
  return gulp.src(['./dist/datum.js'])
  .pipe(babel(BABEL_CONFIG))
  .pipe(uglify())
  .pipe(rename('datum.min.js'))
  .pipe(gulp.dest(DEST))
});

gulp.task('default',['publish']);
