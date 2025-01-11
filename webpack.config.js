const CopyFilePlugin = require("copy-webpack-plugin");

const base = {
  output: {
    filename: '[name]',
    path: `${__dirname}/dist/`
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: "ts-loader"
    },
    {
      test: /\.(d.ts)$/,
      loader: 'ignore-loader'
    }
    ]
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".json", ".html", ".d.ts"]
  },
  plugins: [
    new CopyFilePlugin({
      patterns: [{
        from: './**/*.{css,html,png,ttf,woff2}',
        globOptions: {
          ignore: ['**/node_modules/']
        },
        context: './src'
      }]
    }),
    new CopyFilePlugin({
      patterns: [{
        from: './**/**/*.svg',
        globOptions: {
          ignore: ['**/node_modules/']
        },
        context: './src'
      }]
    })
  ],
  mode: "production",
  devtool: "inline-source-map"
}

const main = {
  ...base,
  target: 'electron-main',
  entry: {
    'index.js': './src/index.ts',
  }
}

const renderer = {
  ...base,
  target: 'electron-renderer',
  entry: {
    'app/player/main.js': './src/app/player/main.tsx',
    'app/playlist/main.js': './src/app/playlist/main.tsx',
  }
}


const preload = {
  ...base,
  target: 'electron-preload',
  entry: {
    'preload/player.js': './src/preload/player.ts',
    'preload/playlist.js': './src/preload/playlist.ts',
  }
}

module.exports = [main, renderer, preload]
