const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv').config({ path: __dirname + '/.env' });  // Add this line at the top

module.exports = {
    mode: 'development',

    entry: './index.js',

    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'main.js',
    },

    target: 'web',

    devServer: {
        host: '0.0.0.0',
        port: 50005,
        static: {
            directory: path.join(__dirname, 'public'),
        },
        open: true,
        hot: true,
        liveReload: true,
    },

    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            // Add your aliases here
        },
        fallback: {
            "crypto": require.resolve("crypto-browserify"),
            "process": require.resolve("process/browser")
            // Removed "dotenv": require.resolve("dotenv")
        },
    },

    // Add this plugin to define process.env variables based on dotenv.parsed
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(dotenv.parsed)  // Use dotenv.parsed instead of process.env
        })
    ],

    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: 'babel-loader',
            },
        ],
    },
};
