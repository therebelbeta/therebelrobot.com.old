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
var clean = require('gulp-rimraf');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var util = require('gulp-util');
var yargs = require('yargs');

gulp.task('clean', function() {
  gulp.src('./server/public', {
      read: false
    })
    .pipe(clean());
});

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
    .pipe(minifyCSS())
    .pipe(source('bundle.min.css'))
    .pipe(gulp.dest('./server/public/'))
});

gulp.task('minifyHTML', function() {
  var opts = {
    comments: true,
    spare: true
  };
  gulp.src(['./client/html/**/*.html', '!./client/html/index.html'])
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest('./server/public/templates/'))
  gulp.src('./client/html/index.html')
    .pipe(minifyHTML(opts))
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
    .pipe(source('bundle.css'))
    .pipe(gulp.dest('./server/public/'));
});

gulp.task('uglify', ['browserify'], function() {
  gulp.src('./server/public/bundle.js')
    .pipe(uglify())
    .pipe(source('bundle.min.js'))
    .pipe(gulp.dest('./server/public/'))

});

gulp.task('assets', function() {
  gulp.src(['./client/fonts', './client/img', './client/misc'])
    .pipe(gulp.dest('./server/public/'))
});

gulp.task('watch', function() {
  var watchJSclient = gulp.watch('./client/js/**/*.js', ['jshint-client',
    'browserify'
  ]);
  var watchJSserver = gulp.watch(['./server/**/*.js', '!./server/public/**'], [
    'jshint-server'
  ]);
  var watchCSS = gulp.watch('./client/sass/**/*.scss', ['sass']);
  var watchHTML = gulp.watch('./client/html/**/*.html', ['minifyHTML']);
  var watchAssets = gulp.watch(['./client/fonts/**/*', './client/img/**/*',
    './client/misc/**/*'
  ], ['assets']);
  watchJSclient.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type +
      ', running tasks...');
  });
  watchJSserver.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type +
      ', running tasks...');
  })
  watchCSS.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type +
      ', running tasks...');
  })
  watchHTML.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type +
      ', running tasks...');
  })
  watchAssets.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type +
      ', running tasks...');
  });
})

gulp.task('nodemon', function() {
  nodemon({
      script: 'app.js',
      ext: 'html js',
      watch: [
        "server/"
      ],
      ignore: [
        '**/*.ignore.*',
        '.git',
        'node_modules/**/node_modules',
        'node_modules',
        'client'
      ]
    })
    .on('restart', function() {
      console.log('Nodemon restarting...')
    })

});

gulp.task('default', ['clean', 'jshint-server', 'browserify', 'sass',
  'minifyHTML'
]);
gulp.task('deploy', []);
gulp.task('develop', ['default', 'watch', 'nodemon']);
