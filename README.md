# jekyll-tasks

[![npm version](https://badge.fury.io/js/jekyll-tasks.svg)](https://badge.fury.io/js/jekyll-tasks)

A set of gulp tasks and boilerplate setup for Jekyll projects

## What is it?
This is an opinionated Jekyll setup that takes a gulp instance and registers gulp tasks related to running Jekyll projects.

## Installation:
```sh
npm install jekyll-tasks --save
```

### Requirements:
* Gulp
* Node.js >= v4
* Ruby
* Jekyll


### Optional:
* jekyll-feed gem (simply remove it from your config if you do not want it)
* jekyll-paginate gem (simply remove it from your config if you do not want it)

### Features:
* Project setup
* Browser Sync and Local Dev server
* Sass, Autoprefixer, and minification of CSS
* Webpack and Babel

### Usage:
To use this library, pass in your "gulp" instance in your gulpfile.js to jekyll-tasks

```js
let gulp = require('gulp');
require('jekyll-tasks')(gulp);
```

Once you do this, you can use the following
___
#### Primary Tasks:
* `gulp setup-project` - Initializes your project src code in a directory called `src`. The directory structure looks like
```
src\
    _drafts\
    _includes\
    _js\
        index.js (this is the Webpack entry point)
    _layouts\
    _plugins\
    _posts\
    _scss\
        var\
        src\
        main.scss (this is the Sass entry point)
    builds\ (compiled resources)
    static\
        font\
        images\
    _config.yml
    .editorconfig
    404.html
    archive.html
    index.html
```
You should add the following to your .gitignore after your project is set up
```
_site
src/builds
```
* `gulp dev` - Launches your development server and begins watching your files
* `gulp build` - Builds your site
___
#### Other Tasks (these shouldn't need to be used normally):
* `gulp jekyll-build` - Builds your jekyll site into `_site`
* `gulp jekyll-build:drafts` - Same as `jekyll-build` but with drafts included
* `gulp jekyll-rebuild` - Same as `jekyll-build:drafts` but reloads the page
* `gulp browser-sync` - Launches a browser-sync server
* `gulp sass` - Compiles the development version of your CSS
* `gulp sass:prod` - Same as the previous but the CSS is minified
* `gulp webpack:dev` - Compiles the development version of your Javascript
* `gulp webpack:prod` - Compiles the production version of your Javascript
* `gulp watch` - Watches your file system for changes and executes the appropriate task

___
## Options:
You can pass in an options object to overwrite defaults and set deployment information.
```js
let gulp = require('gulp');
let options = {};
require('jekyll-tasks')(gulp, options);
```

* `options.webpackDevConfig` - Development Webpack Config. See the source code for the default config
* `options.webpackProdConfig` - Production Webpack Config. See the source code for the default config


## License
Released under the [MIT License](http://www.opensource.org/licenses/MIT)
