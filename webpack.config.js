var path = require('path');
module.exports = {
    entry: './ts/DragManager.ts',
    output: {
        path: __dirname,
        filename: 'DragDropTs.js'
    },
    watchOptions: {
        poll: 250
    },

    // Currently we need to add '.ts' to resolve.extensions array.
    resolve: {
      extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
    },

    // Source maps support (or 'inline-source-map' also works)
    devtool: 'source-map',

    // Add loader for .ts files.
    module: {
      loaders: [
        {
          test: /\.ts$/,
          loader: 'ts-loader'
        }
      ]
    }
};
