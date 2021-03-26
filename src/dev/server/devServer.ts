import express from "express";
import prodApp from "../../prod/server/prodApp";
import webpack from "webpack";
import { Server } from "socket.io";
import webpackConfig from "../webpack.config";
import http from "http";
import fs from "fs-extra";
import path from "path";

const devApp = express();
devApp.use(prodApp);

const devServer = http.createServer(devApp);
devServer.listen(process.env.APP_PORT , () => {
	const io = new Server(devServer);

	let lastFail: string[];

	function sendFail(): void {
		io.emit("devBuildFail", lastFail);
	}

	function sendSuccess(): void {
		io.emit("devBuildSuccess");
	}

	io.on("connection", () => {
		if (lastFail) sendFail();
	});

	fs.emptyDirSync(path.resolve(process.cwd(), "dist"));

	webpack(webpackConfig)
		.watch({}, (err, stats) => {
			if (err) throw err;

			process.stdout.write(stats.toString({
				colors: true,
				modules: false,
				children: false,
				chunks: false,
				chunkModules: false,
			}) + "\n");

			const statObj = stats.toJson();
			const eCount = statObj.errors.length;
			const wCount = statObj.warnings.length;
			console.log(`completed with ${eCount} error${eCount === 1 ? "" : "s"} and ${wCount} warning${wCount === 1 ? "" : "s"}`);

			if (stats.hasErrors()) {
				lastFail = stats.compilation.errors.map(e => e.message);
				sendFail();
			} else {
				lastFail = null;
				console.log(`dev server running on port ${process.env.APP_PORT }`);
				sendSuccess();
			}
		});
});
