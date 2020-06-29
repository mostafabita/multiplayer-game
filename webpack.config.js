const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: {
    client: './src/client/main.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin([
      { from: 'src/client/favicon.png' },
      { from: 'src/client/assets', to: 'assets' },
      { from: 'src/server/main.js', to: 'server.js' },
    ]),
    new HtmlWebpackPlugin({
      title: 'Multiplayer Game',
      subtitle: 'websocket',
      contact: 'http://www.linkedin.com/in/mostafabita',
      template: 'src/client/index.hbs',
      files: {
        css: ['https://fonts.googleapis.com/css?family=Roboto:400,500,700,900&display=swap'],
        js: ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js'],
      },
    }),
    new NodemonPlugin({
      watch: path.resolve('./dist'),
      script: './dist/server.js',
      browser: 'google chrome',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      { test: /\.hbs$/, loader: 'handlebars-loader' },
    ],
  },
};
