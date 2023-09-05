const path = require('path');
const webpack = require('webpack'); // Add this line at the top

module.exports = {
    mode: 'development',

    entry: './index.js',

    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'main.js',
    },

    target: 'web',

    devServer: {
        port: 55000,
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
            "process": require.resolve("process/browser") // Add this line for process polyfill
        },
    },

    // Add this plugin to define process.env variables
    plugins: [
        new webpack.DefinePlugin({
            'process.env': JSON.stringify(process.env)
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
