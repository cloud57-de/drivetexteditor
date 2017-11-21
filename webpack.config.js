var path = require('path');

var SRC_DIR = path.resolve(__dirname,"src");
var DIST_DIR = path.resolve(__dirname,"dist");

const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var config = {
    entry: SRC_DIR + "/index.js",
    output:{
        path : DIST_DIR,
        filename : "dte.js",
        publicPath: "/"
    },
    plugins: [
        new UglifyJSPlugin({
            test: /\.js?/,
            include: SRC_DIR,
        }),
        new CopyWebpackPlugin([
          { from: "src/index.html" },
          { from: "src/default.css" },
          { from: "res/favicon.ico" }
        ])
    ]
}

module.exports = config;
