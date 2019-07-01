const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/pages/home.tsx',
    playground: './src/pages/playground.tsx',
    'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
    'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
  },
  output: {
    filename: '[name].bundle.js'
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {test: /\.tsx?$/, use: 'ts-loader'},
      {
        // loader for Bootstrap CSS
        test: /\.css$/,
        include: /node_modules/,
        use: [
          {loader: 'style-loader'},
          {loader: 'css-loader'},
        ]
      },
      {
        // CSS modules for this app
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {loader: 'style-loader'},
          {
            loader: 'css-loader',
            options: {modules: true},
          },
        ]
      },
      {
        // generate .d.ts files for CSS modules
        enforce: 'pre',
        test: /\.css$/,
        exclude: /node_modules/,
        use: [
          {loader: 'typed-css-modules-loader'},
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: 'images/[name]-[hash].[ext]',
          },
        },
      },
      {
        test: /\.ttl$/,
        use: {loader: 'raw-loader'}
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'RAM shapes - Home',
      chunks: ['index'],
      template: 'src/pages/template.hbs',
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      title: 'RAM shapes - Playground',
      chunks: ['playground'],
      template: 'src/pages/template.hbs',
      filename: 'playground.html',
    }),
  ]
};
