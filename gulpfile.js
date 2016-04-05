var gulp          = require('gulp');
var haml          = require('gulp-haml');
var imagemin      = require('gulp-imagemin');
var gutil         = require('gulp-util');
var sourcemaps    = require('gulp-sourcemaps');
var uglify        = require('gulp-uglify');
var livereload    = require('gulp-livereload');
var sass          = require('gulp-sass');
var less          = require('gulp-less');
var gulpif        = require('gulp-if');
var plumber       = require('gulp-plumber');
var htmlmin       = require('gulp-htmlmin');
var sequence      = require('gulp-sequence');
var cssmin        = require('gulp-cssmin');
var autoprefixer  = require('gulp-autoprefixer');
var scsslint      = require('gulp-scss-lint');
var sasslint      = require('gulp-sass-lint');
var lesshint      = require('gulp-lesshint');
var jshint        = require('gulp-jshint');
var coffeelint    = require('gulp-coffeelint');
var del           = require('del');
var babelify      = require('babelify');
var coffeeify     = require('coffeeify');
var browserify    = require('browserify');
var lazypipe      = require('lazypipe');
var express       = require('express');
var path          = require('path');
var watchify      = require('watchify');
var buffer        = require('vinyl-buffer');
var source        = require('vinyl-source-stream');
var rename        = require('gulp-rename');

var config = require('./gulp.config');

// Clear build directory
gulp.task("clean", function () {
  return del(config.dest);
});

gulp.task("compile:views", function () {
  return gulp.src(config.views.paths)
    .pipe(plumber())
    .pipe(gulpif('*.html', htmlmin()))
    .pipe(gulpif('*.haml', haml()))
    .pipe(gulp.dest(config.views.dest))
    .pipe(livereload());
});

gulp.task("compile:styles", function () {
  return gulp.src(config.styles.entrypoints)
    .pipe(plumber())
    .pipe(gulpif(config.sourcemaps, sourcemaps.init()))
    .pipe(gulpif('*.less',
      less({
        paths: config.styles.includePaths
      })
    ))
    .pipe(gulpif('*.{scss,sass}',
      sass({
        includePaths: config.styles.includePaths,
      })
    ))
    .pipe(autoprefixer({
      browsers: [
        'last 2 versions',
        'android 4',
        'opera 12'
      ]}
    ))
    .pipe(gulpif(config.minify, cssmin()))
    .pipe(gulpif(config.minify, rename({suffix: '.min'})))
    .pipe(gulpif(config.sourcemaps, sourcemaps.write('.')))
    .pipe(gulp.dest(config.styles.dest))
    .pipe(livereload());
});

function bundle(opts) {

  var bundler = browserify(config.scripts.entrypoint)
    .transform(babelify, {
      presets: ["es2015"],
      extensions: [".es6"]
    })
    .transform(coffeeify, {
      bare: true,
      extensions: [".coffee"]
    });

  if (opts.watch) {
    watchify(bundler);
  }

  function rebundle () {
    return bundler.bundle()
      .on('error', gutil.log)
      .on('end', function(){
        gutil.log('Browserify: Bundled');
      })
      .pipe(source(config.scripts.output))
      .pipe(buffer())
      .pipe(gulpif(config.sourcemaps, sourcemaps.init()))
      .pipe(gulpif(config.minify, uglify()))
      .pipe(gulpif(config.minify, rename({suffix: '.min'})))
      .pipe(gulpif(config.sourcemaps, sourcemaps.write('.')))
      .pipe(gulp.dest(config.scripts.dest));
  }

  bundler.on('update', rebundle);

  if (!opts.watch) {
    return rebundle();
  }
}

gulp.task("compile:scripts", function () {
  bundle({watch: false});
});

// Minify images and copy to build directory
gulp.task("copy:images", function () {
  return gulp.src(config.images.paths)
    .pipe(imagemin({
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest(config.images.dest));
});

// Copy fonts to build directory
gulp.task("copy:fonts", function () {
  return gulp.src(config.fonts.paths)
    .pipe(gulp.dest(config.fonts.dest));
});

gulp.task("lint:scripts", function() {
  var lintJs = lazypipe()
    .pipe(jshint)
    .pipe(jshint.reporter, 'jshint-stylish');

  var lintCoffee = lazypipe()
    .pipe(coffeelint)
    .pipe(coffeelint.reporter);

  return gulp.src(config.scripts.paths)
    .pipe(gulpif('*.{js,es6}', lintJs()))
    .pipe(gulpif('*.coffee', lintCoffee()))
  ;
});

// Lint styles and output to console
gulp.task("lint:styles", function () {
  var lintLess = lazypipe()
    .pipe(lesshint)
    .pipe(lesshint.reporter);

  var lintSass = lazypipe()
    .pipe(sasslint)
    .pipe(sasslint.format);

  var lintScss = lazypipe()
    .pipe(scsslint);

  return gulp.src(config.styles.paths)
    .pipe(gulpif('*.less', lintLess()))
    .pipe(gulpif('*.sass', lintSass()))
    .pipe(gulpif('*.scss', lintScss()));
});

// Launch express server
gulp.task("serve", function () {
  var app = express();
  app.use(express.static(path.join(__dirname, config.dest)));
  app.listen(config.port);
});

// Watch changes and recompile
gulp.task("watch", function () {
  livereload.listen();

  gulp.watch(config.scripts.paths, ["lint:scripts"]);
  gulp.watch(config.styles.paths, ["lint:styles", "compile:styles"]);
  gulp.watch(config.views.paths, ["compile:views"]);

  bundle({watch: true});

  gulp.watch(config.src + "/**/*", function (file) {
    livereload.changed(file.path);
  });
});

gulp.task("build", [
  "compile:scripts",
  "compile:styles",
  "compile:views",
  "copy:fonts",
  "copy:images"
]);

gulp.task("default", function(callback){
  sequence("build", "serve", "watch", callback);
});
