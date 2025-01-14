const path = require('path')
const util = require('./util')

function resolve(dir) {
  return path.resolve(__dirname, '..', dir)
}

module.exports = {
  entry: util.entry,
  output: {
    path: resolve('dist/'),
    publicPath: '/',
    chunkFilename: 'js/[id].chunk.js',
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            less: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
            css: ['style-loader', 'css-loader', 'postcss-loader']
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.ejs$/,
        exclude: /node_modules/,
        loader: 'ejs-loader'
      },

      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loaders: [
          {
            loader: 'url-loader',
            query: {
              limit: 10,
              name: 'img/[name].[ext]'
            }
          },
          {
            loader: 'image-webpack-loader',
            query: {
              gifsicle: {
                interlaced: false
              },
              mozjpeg: {
                quality: 65,
              },
              pngquant: {
                quality: '65-90',
                speed: 4,
              },
              svgo: {
                plugins: [
                  {
                    removeViewBox: false,
                  },
                  {
                    removeEmptyAttrs: false,
                  }
                ]
              }
            }
          }
        ]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        query: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.less', '.css', '.ejs', '.html', '.vue'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      'layout': resolve('src/layout'),
      'assets': resolve('src/assets'),
      'components':resolve('src/components'),
      'util':resolve('src/util'),
      '@': resolve('src'),
      'static': resolve('static')
    }
  },
  plugins: util.HtmlWebpackPlugins,
}
