/*
* @Author: gbk
* @Date:   2016-05-10 23:45:10
* @Last Modified by:   gbk
* @Last Modified time: 2016-11-18 23:24:51
*/

'use strict';

var fs = require('fs');

var Balancer = require('load-balancer');
var UglifyJs = require('uglify-js');
var postcss = require('postcss');
var cssnano = require('cssnano');
var processer = new postcss([
  cssnano({
    postcssDiscardUnused: {
      disable: true
    },
    postcssZindex: {
      disable: true
    },
    autoprefixer: {
      add: true,
      browsers: [
        '> 1%',
        'iOS >= 7',
        'Android >= 2.3',
        'FireFoxAndroid >= 46'
      ]
    }
  })
]);

// minify worker
new Balancer.Worker().receive(function(master, context, file, callback) {

  // minify js file
  if (/\.js$/.test(file)) {
    console.log('Minify file: ' + file);
    var result = UglifyJs.minify(file, {
      mangle: context.mangle,
      compress: {
        warnings: false,
        drop_console: !context.keepconsole
      },
      comments: false
    });
    fs.writeFileSync(file.replace(/\.js$/, context.minifyExtension + '.js'), result.code);
    callback();

  // minify css file
  } else if (/\.css$/.test(file)) {
    console.log('Minify file: ' + file);
    processer.process(fs.readFileSync(file, 'utf-8'), {
      from: file,
      to: file
    }).then(function(result) {
      fs.writeFileSync(file.replace(/\.css$/, context.minifyExtension + '.css'), result.css);
      callback();
    });

  // in case of files not support
  } else {
    callback();
  }
});
