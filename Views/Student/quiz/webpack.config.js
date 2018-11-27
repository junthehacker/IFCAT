var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './main.js',
  output: { 
            path: path.join(__dirname, '/../', '/../', '/../', '/public/', '/js/'), 
            filename: 'start-quiz-bundle.js',
            publicPath : '/js'
          },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: JSON.stringify({
          presets: ['es2015', 'react']
        })
      }
    ]
  },
};
