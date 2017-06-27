'use strict'

const _ = require('lodash');
const gulp = require('gulp');
const livereload = require('gulp-livereload');
const server = require('gulp-develop-server');
const browserify = require('browserify');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');
const defaultAssets = require('./config/assets/default');
const gulpLoadPlugins = require('gulp-load-plugins');
const plugins = gulpLoadPlugins({
  rename: {
    'gulp-angular-templatecache': 'templateCache'
  }
});
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const filter = require('gulp-filter');
const mainBowerFiles = require('main-bower-files');
const del = require('del');
const runSequence = require('run-sequence');
const replace = require('gulp-replace');

gulp.paths = {
  dist: 'dist',
};

const paths = {};
paths.src = {};
paths.build = {};
paths.entryScript = 'server';
paths.dist = 'dist';

const src = 'src/client/';
paths.src.scripts = src + 'js/';
paths.src.sass = src + 'sass/';
paths.src.images = src + 'images/';
paths.src.fonts = src + 'fonts/';
paths.src.html = src;

const dist = 'src/client/';
paths.build.scripts = dist + 'js/build';
paths.build.sass = dist + 'css/';
paths.build.images = dist + 'images/';
paths.build.fonts = dist + 'fonts/';

gulp.task('sass', function() {
  return gulp.src('./src/client/scss/style.scss')
    .pipe(sass())
    .pipe(gulp.dest('./src/client/css'))
    .pipe(browserSync.stream());
});

gulp.task('sass:watch', function() {
  gulp.watch('./src/client/scss/**/*.scss');
});

gulp.task('clean:dist', function() {
  return del(paths.dist);
});

gulp.task('copy:bower', function() {
  return gulp.src(mainBowerFiles(['src/client/**/*.js', '!**/*.min.js']))
    .pipe(gulp.dest(paths.dist + '/js/libs'))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist + '/js/libs'));
});

gulp.task('copy:css', function() {
  return gulp.src('./src/client/css/**/*')
    .pipe(gulp.dest(paths.dist + '/css'));
});

gulp.task('copy:img', function() {
  return gulp.src('./src/client/img/**/*')
    .pipe(gulp.dest(paths.dist + '/img'));
});

gulp.task('copy:fonts', function() {
  return gulp.src('./src/client/fonts/**/*')
    .pipe(gulp.dest(paths.dist + '/fonts'));
});

gulp.task('copy:js', function() {
  return gulp.src('./src/client/js/**/*')
    .pipe(gulp.dest(paths.dist + '/js'));
});

gulp.task('copy:views', function() {
  return gulp.src('./src/client/views/**/*')
    .pipe(gulp.dest(paths.dist + '/views'));
});

gulp.task('copy:html', function() {
  return gulp.src('src/client/views/index.html')
    .pipe(gulp.dest(paths.dist + '/'));
});

gulp.task('replace:bower', function() {
  return gulp.src([
      './src/client/dist/**/*.html',
      './src/client/dist/**/*.js',
    ], {
      base: './'
    })
    .pipe(replace(/bower_components+.+(\/[a-z0-9][^/]*\.[a-z0-9]+(\'|\"))/ig, 'js/libs$1'))
    .pipe(gulp.dest('./'));
});

gulp.task('server:start', () => {
  server.listen({
    path: paths.entryScript
  });
});
gulp.task('server:restart', server.restart);

gulp.task('build:dist', function(callback) {
  runSequence('clean:dist', 'scripts', 'uglify', 'sass', 'copy:bower', 'copy:css', 'copy:img', 'copy:fonts', 'copy:js', 'copy:views', 'copy:html', 'replace:bower', callback);
});

//Development
gulp.task('scripts', () => {
  return browserify({
      debug: true,
      entries: [paths.src.scripts + '/app.js',
        paths.src.scripts + 'services/business.js',
        paths.src.scripts + 'services/department.js',
        paths.src.scripts + 'services/service.js',
        paths.src.scripts + 'services/system.js',
        paths.src.scripts + 'services/implications.js',
        paths.src.scripts + 'services/authentication.js',
        paths.src.scripts + 'services/clients.js',
        paths.src.scripts + 'services/doc-type.js',
        paths.src.scripts + 'services/job.js',
        paths.src.scripts + 'services/document.js',
        paths.src.scripts + 'services/email.js',
        paths.src.scripts + 'services/request-type.js',
        paths.src.scripts + 'services/document-status.js',
        paths.src.scripts + 'services/survey-response.js',
        paths.src.scripts + 'services/report.js'
      ]
    })
    .transform("babelify", {
      presets: ["es2015", "react"]
    })
    .bundle()
    .pipe(source('app.js'))
    .pipe(streamify(uglify()))
    .pipe(streamify(rename({
      suffix: ".min"
    })))
    .pipe(gulp.dest(paths.build.scripts));
});

// JS minifying task
gulp.task('uglify', function() {
  var assets = _.union(
    defaultAssets.client.lib.js
  );

  return gulp.src(assets)
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify({
      mangle: false
    }))
    .pipe(plugins.concat('libs.min.js'))
    .pipe(gulp.dest(paths.build.scripts));
});

gulp.task('images', () => {
  return gulp.src(paths.src.images + '**/*')
    .pipe(gulp.dest(paths.build.images))
    .pipe(livereload());
});

// JS linting task
gulp.task('jshint', function() {
  var assets = _.union(
    defaultAssets.server.gulpConfig,
    defaultAssets.server.allJS
  );

  return gulp.src(assets)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('default'))
    .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('build:linux', ['sass', 'scripts', 'uglify', 'images', 'jshint']);
gulp.task('default', ['sass', 'sass:watch', 'scripts', 'uglify', 'images', 'jshint', 'server:start']);
