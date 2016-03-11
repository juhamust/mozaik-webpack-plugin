import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import listDirs from 'listdirs';

class FileListPlugin {

  constructor(options) {
    options = options || {};
    console.log('options', options);
    this.plugins = [];
    this.pluginDir = options.pluginDir;

    if (!this.pluginDir) { return console.error('Provide pluginDir as option '); }

    this.plugins = _.chain(fs.readdirSync(this.pluginDir))
      .filter((entry) => {
        return entry.match(/mozaik-ext-/);
      })
      .value();

    console.log('Plugins', this.plugins);
    return;

    var ignored = ['node_modules'];
    (this.pluginDir, (err, list) => {
      if (err) { return console.error(err); }
      console.log(list);
    }, ignored);
  }

  _collectStyles(targetPath) {
    _.each(this.plugins, (pluginName) => {
      var styleFile = path.join(this.pluginDir, pluginName, 'styl/style.styl');
      console.log('Style file', styleFile);
    });
  }

  apply(compiler) {

    compiler.plugin('emit', (compilation, callback) => {
      // Create a header string for the generated file:
      var filelist = 'In this build:\n\n';

      this.collectStyles();

      return callback();

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
        source: () => {
          return filelist;
        },
        size: () => {
          return filelist.length;
        }
      };

      callback();
    });
  }
}

export default FileListPlugin;
