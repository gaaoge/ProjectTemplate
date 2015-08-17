/**
 * Created by GG on 15/7/23.
 */

var gulp = require('gulp');
var del = require('del');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var replace = require('gulp-replace');
var ftp = require('gulp-ftp');
var gutil = require('gulp-util');
var pkg = require('./package.json');

var path = {
    index: 'src/index.html',
    asset: ['src/**/*', '!src/css/**/*', '!src/js/**/*', '!src/index.html'],
    dest: 'build/',
    test: 'build/**/*',
    publish: 'build/index.html'
};

gulp.task('clean', function (cb) {
    del([path.dest], cb);
});

gulp.task('copy', ['clean'], function () {
    return gulp.src(path.asset)
        .pipe(gulp.dest(path.dest));
});

gulp.task('usemin', ['clean'], function () {
    return gulp.src(path.index)
        .pipe(usemin({
            css: [minifyCss()],
            js: [uglify()]
        }))
        .pipe(gulp.dest(path.dest));
});

gulp.task('default', ['copy', 'usemin']);

//测试
gulp.task('test', ['default'], function () {
    return gulp.src(path.test)
        .pipe(ftp({
            host: '220.181.8.33',
            port: '16321',
            user: 'wangjun2012',
            pass: 'wangjun2012',
            remotePath: 'gg/' + pkg.name
        }))
        .pipe(gutil.noop());
});

/*
 * 发布（替换为线上地址并添加版本号，以及上传到ftp）
 */
gulp.task('publish', ['default'], function () {
    var projectPath = 'http://img' + Math.round(Math.random() * 6) + '.cache.netease.com/utf8/3g/gg/' + pkg.name;
    var date = new Date().getTime();
    return gulp.src(path.publish)
        .pipe(replace('href="css/index.min.css"', 'href="' + projectPath + '/css/index.min.css?v=' + date + '"'))
        .pipe(replace('src="js/index.min.js"', 'src="' + projectPath + '/js/index.min.js?v=' + date + '"'))
        .pipe(gulp.dest(path.dest))
        .pipe(ftp({
            host: '220.181.29.249',
            port: '16321',
            user: 'wangjun2012',
            pass: 'wangjun2012',
            remotePath: 'gg/' + pkg.name
        }))
        .pipe(gutil.noop());
});