var brototype = require('brototype');
var browserify = require('browserify');
var concat = require('gulp-concat');
var debug = require('debug');
var exec = require('gulp-exec');
var gulp = require('gulp');
var gulpif = require('gulp-if');
var jshint = require('gulp-jshint');
var jshintStylish = require('jshint-stylish');
var _ = require('lodash');
var minifyCss = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var nodemon = require('gulp-nodemon');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var yargs = require('yargs');

gulp.task('browserify', ['jshint-client'], function() {
  return browserify('./client/js/app.js')
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(gulp.dest('./server/public/'));
});

gulp.task('jshint-client', function() {
  return gulp.src('./client/js/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish));
});
gulp.task('jshint-server', function() {
  return gulp.src(['./server/**/*.js', '!./server/public/**'])
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish));
});

gulp.task('minifyCSS', function() {
  gulp.src('./server/public/bundle.css')
    .pipe(minifyCss())
    .pipe(rename('bundle.min.css'))
    .pipe(gulp.dest('./server/public/'))
});

gulp.task('minifyHTML', function() {
  var opts = {
    comments: true,
    spare: true
  };
  gulp.src(['./client/html/**/*.html', '!./client/html/index.html'])
    .pipe(minifyHtml(opts))
    .pipe(gulp.dest('./server/public/templates/'))
  gulp.src('./client/html/index.html')
    .pipe(minifyHtml(opts))
    .pipe(gulp.dest('./server/public/'))
});


gulp.task('sass', function() {
  return gulp.src('./client/sass/app.scss')
    .pipe(sass({
      sourcemap: true,
      sourcemapPath: '../sass'
    }))
    .on('error', function(err) {
      console.log(err.message);
    })
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest('./server/public/'));
});

gulp.task('uglify', ['browserify'], function() {
  gulp.src('./server/public/bundle.js')
    .pipe(uglify())
    .pipe(rename('bundle.min.js'))
    .pipe(gulp.dest('./server/public/'))

});

gulp.task('assets', function() {
  gulp.src('./client/fonts/**/*')
    .pipe(gulp.dest('./server/public/fonts/'))
  gulp.src('./client/img/**/*')
    .pipe(gulp.dest('./server/public/img/'))
  gulp.src('./client/misc/**/*')
    .pipe(gulp.dest('./server/public/misc/'))
});

gulp.task('watch', function() {
  gulp.watch('client/js/**/*.js', ['jshint-client', 'browserify']);
  gulp.watch(['server/**/*.js', '!server/public/**'], ['jshint-server']);
  gulp.watch('client/sass/**/*.scss', ['sass']);
  gulp.watch('client/html/**/*.html', ['minifyHTML']);
  gulp.watch(['client/fonts/**/*', 'client/img/**/*', 'client/misc/**/*'], [
    'assets'
  ]);
})


gulp.task('default', ['jshint-server', 'browserify', 'sass',
  'minifyHTML', 'assets', 'watch'
]);
gulp.task('deploy', []);