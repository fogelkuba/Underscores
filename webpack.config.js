'use strict'; // eslint-disable-line

const path = require('path');
const argv = require('minimist')(process.argv.slice(2));
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const mergeWith = require('lodash/mergeWith');

const isProduction = !!((argv.env && argv.env.production) || argv.p);

const jsLoader = {
	test: /\.js$/,
	exclude: /node_modules/,
	use: [ 'babel' ],
};

let mergeWithConcat = function () {
	const args = [].slice.call(arguments);
	args.push((a, b) => {
		if (Array.isArray(a) && Array.isArray(b)) {
			return a.concat(b);
		}
		return undefined;
	});
	return mergeWith.apply(this, args);
};


// Add Hot Module Replacement only on watcher script
if (!!argv.watch) {
	jsLoader.use.unshift('monkey-hot?sourceType=module');
}

let webpackConfig = {
	entry: [
		path.join(__dirname, 'js/main.js'),
		path.join(__dirname, 'css/sass/style.scss')
	],
	devtool: (!isProduction ? '#source-map' : undefined),
	output: {
		path: __dirname,
		publicPath: '/wp-content/themes/underscores/',
		filename: 'js/app.js',
	},
	module: {
		rules: [
			jsLoader,
			// {
			// 	enforce: 'pre',
			// 	test: /\.js?$/,
			// 	include: path.join(__dirname, 'js/source'),
			// 	loader: 'eslint',
			// },
			{
				test: /\.scss$/,
				include: path.join(__dirname, 'css/sass'),
				loader: ExtractTextPlugin.extract({
					fallbackLoader: 'style',
					loader: [
						'css?sourceMap',
						'postcss',
						'sass?sourceMap',
					],
				}),
			},
		]
	},
	resolveLoader: {
		moduleExtensions: ['-loader'],
	},
	plugins: [
		new webpack.LoaderOptionsPlugin({
			options: {

				postcss: [
					autoprefixer({ browsers: ['last 2 versions', 'android 4', 'opera 12'] }),
				],
				context: '/'
			}
		}),
		new ExtractTextPlugin({
			filename: `css/style.css`,
			allChunks: true,
			disable: !!argv.watch,
		}),
	]
};

if (!!argv.watch) {
	webpackConfig.entry.unshift('webpack-hot-middleware/client?timeout=20000&reload=false');
	webpackConfig = mergeWithConcat(webpackConfig, require('./webpack.config.watch'));
}

module.exports = webpackConfig;