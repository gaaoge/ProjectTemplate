/**
 * Created by GG on 15/7/23.
 */

var gulp = require('gulp');
var del = require('del');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');

var path = {
    index: 'src/index.html',
    asset: ['src/**/*', '!src/css/**/*', '!src/js/**/*', '!src/*.html'],
    dest: 'build/'
};

gulp.task('clean', function (cb) {
    del([path.dest], cb);
});

gulp.task('copy', ['clean'], function () {
    gulp.src(path.asset)
        .pipe(gulp.dest(path.dest));
});

gulp.task('usemin', ['clean'], function () {
    gulp.src(path.index)
        .pipe(usemin({
            css: [minifyCss()],
            js_lib: [uglify()],
            js_index:[uglify()]
        }))
        .pipe(gulp.dest(path.dest));
});

gulp.task('default', ['copy', 'usemin']);