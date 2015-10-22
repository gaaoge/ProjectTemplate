/**
 * Created by GG on 15/7/23.
 */

var pkg = require('./package.json');
var gulp = require('gulp');
var del = require('del');
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var ftp = require('vinyl-ftp');

var path = {
    index: 'src/index.html',
    asset: ['src/**/*', '!src/css/**/*', '!src/js/**/*', '!src/index.html'],
    build: 'build/'
};

var ftppass = {
    test: {
        username: 'ynren1',
        password: 'ynren@163'
    },
    publish: {
        username: 'wangjun2012',
        password: 'wangjun2012'
    }
};

gulp.task('clean', function (cb) {
    return del([path.build], cb);
});

gulp.task('copy', ['clean'], function () {
    return gulp.src(path.asset)
        .pipe(gulp.dest(path.build));
});

gulp.task('usemin', ['clean'], function () {
    return gulp.src(path.index)
        .pipe(usemin({
            css: [minifyCss()],
            js: [uglify()]
        }))
        .pipe(gulp.dest(path.build));
});

gulp.task('default', ['copy', 'usemin']);

gulp.task('test', ['default'], function () {
    var conn = ftp.create({
        host: '220.181.98.57',
        port: '2100',
        user: ftppass.test.username,
        password: ftppass.test.password,
        parallel: 5
    });

    return gulp.src(path.build + '**/*')
        .pipe(conn.dest(pkg.author + '/' + pkg.name));
});

gulp.task('publish', ['default'], function () {
    var conn = ftp.create({
        host: '220.181.29.249',
        port: '16321',
        user: ftppass.publish.username,
        password: ftppass.publish.password,
        parallel: 5
    });

    return gulp.src(path.build + '**/*')
        .pipe(conn.dest('3g/' + pkg.author + '/' + pkg.name));
});