var path    = require('path');
var webpack = require('webpack');

module.exports = {
    entry: ['babel-polyfill', './main.js'],
    output: {
        path: path.join(__dirname, '/../', '/../', '/../', '/public/', '/js/'),
        filename: 'start-quiz-bundle.js',
        publicPath: '/js'
    },
    module: {
        loaders: [
            {
                test: /.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: JSON.stringify({
                    presets: ['es2015', "stage-0", 'react'],
                    plugins: ['transform-es2015-spread', 'transform-object-rest-spread', 'transform-class-properties']
                })
            }
        ]
    },
};
