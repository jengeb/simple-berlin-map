const path = require('path')
const webpack = require('webpack')

const htmlTemplate = require('html-webpack-template')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const devMode = process.env.NODE_ENV !== 'production'

const extractStyles = new MiniCssExtractPlugin({
  filename: devMode ? '[name].css' : '[name].[hash].css',
  chunkFilename: devMode ? '[id].css' : '[id].[hash].css'
})
const copyData = new CopyWebpackPlugin([
  { from: './data/markers.geo.json', to: './data' }
])
const hmr = new webpack.HotModuleReplacementPlugin()

//
// templates for generated html files
//

const createIndexHTML = new HtmlWebpackPlugin({
  inject: false,
  template: htmlTemplate,
  lang: 'de',
  mobile: true,
  chunks: ['index'],
  filename: 'index.html',
  title: 'Karte Aspire'
})

const createIframeHTML = new HtmlWebpackPlugin({
  inject: false,
  template: 'src/entryPoints/iframe/template.html',
  filename: 'iframe.html'
})

module.exports = {
  entry: {
    index: [
      'babel-polyfill',
      'whatwg-fetch',
      './src/entryPoints/index/index.js'
    ],
    iframe: ['./src/entryPoints/iframe/index.js']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dst')
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.(sass)/,
        use: [
          'css-hot-loader',
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          { loader: 'css-loader',
            options: {
              sourceMap: true,
              modules: true,
              importLoaders: 3,
              localIdentName: '[path]-[local]'
            }
          },
          { loader: 'resolve-url-loader', options: { sourceMap: true } },
          { loader: 'postcss-loader',
            options: {
              sourceMap: true,
              plugins: [require('autoprefixer')()]
            }
          },
          { loader: 'sass-loader', options: { sourceMap: true } }
        ]
      },
      {
        test: /\.css/,
        use: [
          'css-hot-loader',
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      },
      {
        test: /\.(png|svg|gif|jpe?g|woff)$/,
        use: ['file-loader']
      }
    ]
  },
  devtool: 'source-map',
  plugins: [
    createIndexHTML,
    createIframeHTML,
    extractStyles,
    copyData,
    hmr
  ],

  resolve: {
    alias: {
      'react': 'preact-compat',
      'react-dom': 'preact-compat',
      '@components': path.resolve(__dirname, 'src/components'),
      '@shared': path.resolve(__dirname, 'src/rbb-data-shared'),
      '@root': path.resolve(__dirname, 'src'),
      '@data': path.resolve(__dirname, 'data')
    }
  },

  // configure webpack-dev-server
  devServer: {
    hot: true,
    open: true,
    index: 'iframe.html'
  }
}
