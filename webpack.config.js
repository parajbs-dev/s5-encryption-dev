const path = require("path");
//const { merge } = require("webpack-merge");

module.exports = {
  entry: "./src/index.ts",
  devtool: false,
  mode: "production",

  module: {
    noParse: [/gun\.js$/, /sea\.js$/],
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          ignore: ["src/**/*.test.ts"],
        },
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      crypto: false ,
      stream: false ,
      path: false ,
      fs: false
    },
  },
  output: {
    path: path.resolve(__dirname, "./dist/bundle"),
    // The filename needs to match the index.web.d.ts declarations file.
    filename: "index.js",
    library: {
      name: 's5client',
      type: 'umd',
    },
  },
};
