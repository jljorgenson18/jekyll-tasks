let gulp = require('gulp');
let browserSync = require('browser-sync');
let sass = require('gulp-sass');
let postcss = require('gulp-postcss');
let autoprefixer = require('autoprefixer');
let cssnano = require('cssnano');
let cp = require('child_process');
let reporter = require('postcss-reporter');
let awspublish = require('gulp-awspublish');
let runSequence = require('run-sequence');
let gutil = require('gulp-util');
let webpack = require('webpack');

let messages = {
  jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

let webpackDevConfig = require('./defaultConfigs/webpack.config.dev.js');
let webpackProdConfig = require('./defaultConfigs/webpack.config.prod.js');

module.exports = (gulp, options) => {
  options = options || {};
  let awsConfig = options.awsConfig;

  /**
   * Build the Jekyll Site
   */
  gulp.task('jekyll-build', (done) => {
    browserSync.notify(messages.jekyllBuild);
    cp.spawn('jekyll', ['build', '--source', './src'], {
      stdio: 'inherit'
    }).on('close', (code) => {
      console.log('Jekyll build finsihed with a code of ' + code);
      done();
    });
  });

  gulp.task('jekyll-build:drafts', (done) => {
    browserSync.notify(messages.jekyllBuild);
    cp.spawn('jekyll', ['build', '--source', './src', '--drafts'], {
      stdio: 'inherit'
    }).on('close', (code) => {
      console.log('Jekyll build finsihed with a code of ' + code);
      done();
    });
  });


  /**
 * Rebuild Jekyll & do page reload
 */
  gulp.task('jekyll-rebuild', ['jekyll-build:drafts'], () => {
    browserSync.reload();
  });

  /**
   * Wait for jekyll-build, then launch the Server
   */
  gulp.task('browser-sync', ['sass', 'jekyll-build:drafts'], () => {
    browserSync({
      server: {
        baseDir: '_site'
      },
      open: false
    });
  });

  /**
   * Compile files from _scss into both _site/builds/css (for live injecting) and site (for future jekyll builds)
   */

  let browsers = ['> 2%', 'last 2 versions', 'ie >= 10', 'iOS >= 7'];

  gulp.task('sass', () => {
    let processors = [
      autoprefixer({browsers}),
      reporter({clearMessages: true})
    ];
    return gulp.src('src/_scss/main.scss')
      .pipe(sass({
        outputStyle: 'expanded',
        sourceComments: true,
        includePaths: ['scss'],
        onError: browserSync.notify
      }).on('error', sass.logError))
      .pipe(postcss(processors, {
        map: true, // inline sourcemaps
        diff: 'src/builds/css/postcss.patch'
      }))
      .pipe(gulp.dest('_site/builds/css'))
      .pipe(browserSync.stream())
      .pipe(gulp.dest('src/builds/css'));
  });

  gulp.task('sass:prod', () => {
    let processors = [
      autoprefixer({browsers}),
      reporter({clearMessages: true}),
      cssnano() // minify the result
    ];
    return gulp.src('_scss/main.scss')
      .pipe(sass({
        outputStyle: 'compressed',
        includePaths: ['scss']
      }).on('error', sass.logError))
      .pipe(postcss(processors))
      .pipe(gulp.dest('src/builds/css'));
  });


  gulp.task('webpack:dev', callback => {
    // run webpack
    webpack(webpackDevConfig, (err, stats) => {
      if(err) {
        throw new gutil.PluginError('webpack', err);
      }
      gutil.log('[webpack]', stats.toString({
        // output options
      }));
      callback();
    });
  });

  gulp.task('webpack:prod', callback => {
    // run webpack
    webpack(webpackProdConfig, (err, stats) => {
      if(err) {
        throw new gutil.PluginError('webpack', err);
      }
      gutil.log('[webpack]', stats.toString({
        // output options
      }));
      callback();
    });
  });

  gulp.task('publish', () => {
    if(!awsConfig) {
      throw new gutil.PluginError('options.awsConfig required for S3 Deployment');
    } else if(!awsConfig.params || !awsConfig.params.Bucket) {
      throw new gutil.PluginError('options.awsConfig.params.Bucket required for S3 Deployment');
    }
    // create a new publisher using S3 options
    // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#letructor-property
    let publisher = awspublish.create(awsConfig);
    return gulp.src('./_site/**')
      .pipe(publisher.publish())
      .pipe(publisher.sync())
      .pipe(awspublish.reporter());
  });

  /**
   * Watch scss files for changes & recompile
   * Watch html/md files, run jekyll & reload BrowserSync
   */
  gulp.task('watch', () => {
    gulp.watch('src/_scss/**/*.scss', ['sass']);
    gulp.watch([
      'src/**/*.html',
      'src/**/*.md',
      'src/_posts/*',
      'src/builds/js/**'
    ], ['jekyll-rebuild']);
    gulp.watch(['src/_js/**/*.js'], ['webpack:dev']);
  });


  /**
   * Default task, running just `gulp` will compile the sass,
   * compile the jekyll site, launch BrowserSync & watch files.
   */
  gulp.task('default', ['browser-sync', 'webpack:dev', 'watch']);
  gulp.task('deploy', (done) => {
    runSequence('sass:prod', 'webpack:prod', 'jekyll-build', 'publish', done);
  });

};
