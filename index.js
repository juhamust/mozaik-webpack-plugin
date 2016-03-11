var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var _  = require('lodash');

function FileListPlugin(options) {
  options = options || {};
  console.log('options', options);
  this.plugins = [];
  this.pluginDir = options.pluginDir;

  if (!this.pluginDir) { return console.error('Provide pluginDir as option '); }

  this.plugins = _.chain(fs.readdirSync(this.pluginDir))
    .filter(function(entry) {
      return entry.match(/mozaik-ext-/);
    })
    .value();

  console.log('Plugins', this.plugins);
  return;

  var ignored = ['node_modules'];
  (this.pluginDir, function(err, list) {
    if (err) { return console.error(err); }
    console.log(list);
  }, ignored);
}

FileListPlugin.prototype._readFile = function(path) {
  return new Promise(function(resolve, reject) {
    fs.access(path, fs.F_OK, function(err) {
      if (err) {
        return resolve('');
      }
      return resolve(require(path));
      //return resolve(fs.readFileSync(path).toString());
    })
  });

}

FileListPlugin.prototype._collectStyles = function(targetPath) {
  var _this = this;

  return Promise.all(_.map(this.plugins, function(pluginName) {
    return _this._readFile(path.join(_this.pluginDir, pluginName, 'styl/index.styl'));
  }))
  .then(function(fileContents) {
    console.log('OUT', fileContents);
  });
}

FileListPlugin.prototype.apply = function(compiler) {
  var _this = this;

  compiler.plugin('emit', function(compilation, callback) {
    // Create a header string for the generated file:
    var filelist = 'In this build:\n\n';

    _this._collectStyles();

    return callback();


    // ------

    console.log('context', compiler.context);

    compilation.fileDependencies.push(path.join(compiler.context, 'foo.txt'));
    compilation.fileDependencies.push('/Users/juha/Work/mozaik-webpack-plugin/test.js');

    console.log('COMPILATION', compilation.fileDependencies, _.keys(compilation.assets));
    return callback();



    // Loop through all compiled assets,
    // adding a new line item for each filename.
    for (var filename in compilation.assets) {
      filelist += ('- '+ filename +'\n');
    }

    // Insert this list into the Webpack build as a new file asset:
    compilation.assets['filelist.md'] = {
      source: function() {
        return filelist;
      },
      size: function() {
        return filelist.length;
      }
    };

    callback();
  });
}

module.exports = FileListPlugin;
