var autoprefixer = require('autoprefixer');
var babel = require('gulp-babel');
var browserSync = require('browser-sync').create();
var cssnano = require('cssnano');
var del = require('del');
var gulp = require('gulp');
var gulpIf = require('gulp-if');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');

gulp.task('sass', function () {
    return gulp.src('src/scss/**/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('src/css'))
        .pipe(browserSync.reload({
            stream: true
        }))
})

gulp.task('babel', function () {
    return gulp.src('src/js/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(gulp.dest('src/js/babel'))
        .pipe(browserSync.reload({
            stream: true
        }))
})

gulp.task('image', function () {
    return gulp.src('src/img/**/*.+(png|jpg|gif|svg)')
        .pipe(cache(imagemin()))
        .pipe(gulp.dest('dist/img'))
})

gulp.task('browserSync:dev', function () {
    browserSync.init({
        server: {
            baseDir: 'src'
        }
    })
})

gulp.task('browserSync:prod', function () {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    })
})

gulp.task('watch', gulp.parallel('browserSync:dev', 'sass', 'babel', function () {
    gulp.watch('src/scss/**/*.scss').on('change', gulp.series('sass'));
    gulp.watch('src/js/*.js').on('change', gulp.series('babel'));
    gulp.watch('src/*.html').on('change', browserSync.reload);
}))


gulp.task('compress', function () {
    return gulp.src('src/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(sourcemaps.init())
        .pipe(gulpIf('*.css', postcss([autoprefixer({ browsers: ['last 2 versions'] }), cssnano()]), sourcemaps.write('.')))
        .pipe(gulp.dest('dist'))
})

gulp.task('clean:dist', function (done) {
    del.sync('dist');
    done()
})

gulp.task('build', gulp.series('clean:dist', 'sass', 'compress', 'image', function (done) {
    done()
}))

gulp.task('start:dev', gulp.series('watch', function (done) {
    done()
}))

gulp.task('start:prod', gulp.series('build', 'browserSync:prod', function (done) {
    done()
}))
