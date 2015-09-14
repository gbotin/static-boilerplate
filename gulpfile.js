var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var haml = require('gulp-haml');
var coffee = require('gulp-coffee');
var watch = require('gulp-watch');
var imagemin = require('gulp-imagemin');
var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var uglify = require('gulp-uglify');
var sass = require('gulp-sass');
var bower = require('main-bower-files');
var htmlmin = require('gulp-htmlmin');
var express = require('express');
var rename = require('gulp-rename');
var path = require('path');

gulp.task("clean", function () {
  del("dist/**");
});

gulp.task("style", function () {
  gulp.src("src/style/**/*.{sass,scss}")
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.init())
      .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest("dist/css"));
});

gulp.task("scripts", function () {
  gulp.src("src/scripts/**/*.coffee")
    .pipe(coffee({bare: true}))
    .pipe(concat('app.js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.init())
      .pipe(uglify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(gulp.dest("dist/js"));
});

gulp.task("images", function () {
  gulp.src("src/images/**/*.{jpg,jpeg,png,gif}")
    .pipe(imagemin())
    .pipe(gulp.dest('dist/images'));
});

gulp.task("fonts", function () {
  gulp.src("src/fonts/**/*")
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task("haml", function () {
  gulp.src("src/**/*.haml")
    .pipe(haml())
    .pipe(gulp.dest('dist/'));
});

gulp.task("bower", function () {
  gulp.src(bower())
    .pipe(gulp.dest('dist/vendor'));
});

gulp.task("serve", function () {
  var app = express();
  app.use(express.static(path.join(__dirname, 'dist')));
  app.listen(3000);
});

gulp.task("watch", function () {
  livereload.listen();

  gulp.watch("src/**/*.coffee", ["scripts"]);
  gulp.watch("src/**/*.{sass,scss}", ["style"]);
  gulp.watch("src/**/*.haml", ["html"]);

  gulp.watch("dist/**/*", function (file) {
    livereload.changed(file.path);
  });
});

gulp.task("build", ["style", "scripts", "bower", "fonts", "haml", "images"]);

gulp.task("default", ["build", "serve", "watch"]);
