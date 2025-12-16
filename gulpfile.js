import  gulp from 'gulp';
import browserSync from 'browser-sync';
import imageminJpj from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imagemin, {gifsicle, optipng, svgo} from 'gulp-imagemin';

const methodCompiller = 'sass'; // Меняем Scss на Sass в зависимости от нужд
const srcFolder = './app';
const paths = {
    srcScss: `${srcFolder}/${methodCompiller}/style.${methodCompiller}`, 
};


import *as dartSass from 'sass';
import gulpSass from 'gulp-sass';
const sass = gulpSass(dartSass);
import webpackStream from 'webpack-stream';
import plumber from 'gulp-plumber';
import notify from 'gulp-notify';
import concat from 'gulp-concat';
import autoprefixer from 'gulp-autoprefixer';
import gulpif from 'gulp-if';
import newer from "gulp-newer";
import { deleteAsync } from 'del';
import gcmq from 'gulp-group-css-media-queries';
import faviconImg from 'gulp-favicons';
import debug from 'gulp-debug';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import cssnano from 'cssnano';
import htmlmin from "gulp-htmlmin";
import cssmin from "gulp-cssmin";
import rename from "gulp-rename";

global.app = {
  gulp,
  isProd: process.argv.includes('--build'),
  paths,
}

function browsersync() {
  browserSync.init({
    server : {
      baseDir: 'app/'
    },
	 browser: "c:\\Program Files\\Firefox Developer Edition\\firefox.exe",
  });
}
/********************************************
* ДЛЯ ЗАПУСКА ПРОКСИ В ДИРЕКТОРИИ СКРИПТА ЗАПУСТИТЕ КОМАНДУ
* PHPCLI .  (ТОЧА ЭТО АРГУМЕНТ ТЕКУЩЕЙ ДИРЕКТОРИИ)
* РАСКОМИНТИРУЙТЕ НИЖНИЙ СКРИПТ И ЗАКОМЕНТИРУЙТЕ ВЕРХНИЙ
*
*
**********************************************
function browsersync() {
  browserSync.init({
	  "ui": {
        "port": 4000
    },
    "server": false,
	"proxy": {
		target: "localhost:9000",
		proxyReq: [
			function(proxyReq) {
				proxyReq.setHeader('X-Special-Proxy-Header', 'foobar');
			}
		]
	},
	 browser: "c:\\Program Files\\Firefox Developer Edition\\firefox.exe",
  });
}

**********************/

function clean() {
  return deleteAsync('dist');
}

function resources(){
  return gulp.src(
    [
      'app/css/style.min.css', 
      'app/css/style.min.css.map', 
      'app/js/main.min.js', 
      'app/js/main.min.js.map', 
      'app/fonts', 
      'app/ht.access'], { encoding: false })
    .pipe(gulp.dest('dist/'))
}


function images() {
  return gulp.src('app/images/**/*')
    .pipe(imagemin(
      [
        gifsicle({ interlaced: true }),
        optipng({ optimizationLevel: 5 }),
        svgo({
          plugins: [
            { removeViewBox: true },
            { cleanupIDs: false }
          ]
        })
      ]
    ))
    .pipe(gulp.dest('dist/images'))
}



export const favicon = () => {
     return gulp.src('app/favicon.png', { encoding: false })
        .pipe(faviconImg({
            icons: {
                appleIcon: true,
                favicons: true,
                online: false,
                appleStartup: false,
                android: false,
                firefox: false,
                yandex: false,
                windows: false,
                coast: false
            }
        }))
        .pipe(gulp.dest('app/favicon/'))
        .pipe(debug({
            "title": "Favicons"
        }));
};



export const scripts = () => {
  return gulp.src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
    .pipe(plumber(
      notify.onError({
        title: "JS",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(webpackStream({
      mode: app.isProd ? 'production' : 'development',
      output: {
        filename: 'main.min.js',
      },
      module: {
        rules: [{
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['@babel/preset-env', {
                  targets: "defaults"
                }]
              ]
            }
          }
        }]
      },
      devtool: !app.isProd ? 'source-map' : false
    }))
    .on('error', function (err) {
      console.error('WEBPACK ERROR', err);
      this.emit('end');
    })
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.stream());
}

export const htmlMinify = () => {
  return gulp.src('app/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true
    }))
    .pipe(gulp.dest('dist'));
}


export const styles = () => {
  return gulp.src(`${paths.srcScss}`, { sourcemaps: true })
    .pipe(plumber(
      notify.onError({
        title: "SCSS",
        message: "Error: <%= error.message %>"
      })
    ))
    .pipe(sass())
    .pipe(autoprefixer({
      cascade: false,
      grid: true,
      overrideBrowserslist: ["last 5 versions"]
    }))
	.pipe(gcmq())
//	.pipe(cssmin())
	.pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(['app/css'], { sourcemaps: '.' }))
    .pipe(browserSync.stream());
};

function watching() {
  gulp.watch(`${paths.srcScss}`, styles).on('change', browserSync.reload);
  gulp.watch(['app/js/main.js'], scripts).on('change', browserSync.reload);
  gulp.watch(['app/*.html']).on('change', browserSync.reload);
  gulp.watch(['app/favicon/*.{ico,png}']).on('change', browserSync.reload);
  gulp.watch(['app/images/*.{jpg,png,svg,jpeg}']).on('change', browserSync.reload);
}

/*
export const imgBuild = await imageminJpj(['app/images/*.{jpg,png}'], {
	destination: 'dist/images',
	plugins: [
		imageminJpegtran()
	]
});
*/

export const dev =  gulp.parallel( styles, scripts, favicon, browsersync, watching);
//export const build =  gulp.series(resources, htmlMinify, images,favicon);
//const builgImg = gulp.series(images, imgBuild);





gulp.task('default', dev)
//gulp.task('build', build, imgBuild)



