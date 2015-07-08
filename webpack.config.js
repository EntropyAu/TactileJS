var path = require('path');
module.exports = {
    entry: './es6/dragdrop.js',
    output: {
        path: __dirname,
        filename: 'dragdrop.js'
    },
    module: {
        loaders: [
            { test: path.join(__dirname, 'es6'), loader: 'babel-loader' }
        ]
    }
};