process.env['NODE_ENV'] = 'production';
var debug = process.env.NODE_ENV !== 'production';
var webpack = require('webpack');
var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

var extractPlugin = new ExtractTextPlugin({ filename: './assets/css/[name].css' });


var commonPlugins = [
    new CleanWebpackPlugin(['build']),
    new HtmlWebpackPlugin({
        template: 'popup.html',
        filename: 'popup.html'
    }),
        new CopyWebpackPlugin([
            { from: 'assets/images/*', to: path.resolve(__dirname, 'build') },
            { from: 'assets/bootstrap/*.js', to: path.resolve(__dirname, 'build') },
            { from: 'manifest.json', to: path.resolve(__dirname, 'build') },
    ], {
        context: path.resolve(__dirname, 'src')
    }),
    extractPlugin,
];

module.exports = {
    context: path.resolve(__dirname, 'src'),
    devtool: debug ? 'inline-sourcemap' : false,
    entry: {
        popup: path.join(__dirname, 'src', 'popup.js'),
        iconAnimation: path.join(__dirname, 'src', 'iconAnimation.js'),
        content: path.join(__dirname, 'src', 'content.js'),
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].min.js',
        publicPath: '/'
    },
    module: {
        rules: [
            //babel-loader
            { 
                test: /\.js$/,
                exclude: /(node_modules|bootstrap)/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ['env']
                    }
                }
            },
            //html-loader
            { 
                test: /\.html$/,
                use: ['html-loader']
            },
            //sass-loader
            {
                test: /\.scss$/,
                include: [
                    path.resolve(__dirname, 'src', 'assets', 'scss'),
                ],
                use: extractPlugin.extract({
                    use: [
                        {
                        loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                minimize: true
                            }
                        },
                        {
                        loader: 'sass-loader',
                            options: {
                                sourceMap: true
                            }
                        }
                    ],
                    fallback: 'style-loader'
                })
            },
            //file-loader(for images)
            {
                test: /\.(jpg|png|gif|svg)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './assets/images/'
                    }
                }]
            },
            //file-loader(for fonts)
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: './assets/fonts/'
                    }
                }]
            }
        ]
    },
    plugins: debug ? [
        ...commonPlugins
    ] : [
        ...commonPlugins,
        new UglifyJsPlugin({ uglifyOptions: { mangle: false }, sourceMap: false }),
    ],
};
