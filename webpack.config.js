var path = require('path');
module.exports = {
    entry: './es6/DragDrop.js',
    output: {
        path: __dirname,
        filename: 'DragDrop.js'
    },
    module: {
        loaders: [
            { test: path.join(__dirname, 'es6'), loader: 'babel-loader' }
        ]
    }
};