import path from "path";
import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import fs from "fs-extra";

fs.removeSync(path.join(__dirname, "dist"));

const config: Configuration = {
	mode: "development",
	entry: {
		"app": "./src/prod/index.tsx",
	},
	output: {
		path: path.resolve(process.cwd(), "dist"),
		filename: "js/[name].js",
	},
	module: {
		rules: [
			{ test: /\.tsx?$/, use: ["ts-loader"] },
			{
				test: /\.((s[ac])|(c))ss$/i,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader:"css-loader",
						options: {
							url: false,
						},
					},
					"sass-loader",
				],
			},
		],
	},
	resolve: {
		extensions: [".js", ".jsx", ".ts", ".tsx", ".scss", ".css"],
	},
	devtool: "source-map",
	plugins: [
		new MiniCssExtractPlugin({
			filename: "css/[name].css",
		}),
		new CopyWebpackPlugin({
			patterns: [
				{ from: "assets", to: "assets" },
			],
		}),
		new HtmlWebpackPlugin(),
	],
};

export default config;
