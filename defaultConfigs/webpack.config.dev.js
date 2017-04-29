'use strict';

const path = require('path');
const webpack = require('webpack');
const processDir = require('process').cwd();

const {version} = require('../package.json');

module.exports = {
  devtool: 'source-map',
  context: path.join(processDir),
  performance: {
    hints: false
  },
  entry: [
    './src/_js/index.js'
  ],
  output: {
    path: path.join(processDir, './src/builds/js/'),
    filename: 'index.bundle.js',
    publicPath: `/builds/js/`
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          'presets': [['es2015', {
            'modules': false
          }]],
          'plugins': [
            'transform-class-properties',
            'transform-object-rest-spread'
          ]
        }
      }
    }, {
      test: /\.json$/,
      loader: 'json-loader'
    }]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ]
};
