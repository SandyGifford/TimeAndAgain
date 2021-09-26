import express from "express";
import prodApp from "../../prod/server/prodApp";
import webpack from "webpack";
import NodeWebSocket from "ws";
import webpackConfig from "../webpack.config";
import http from "http";
import fs from "fs-extra";
import path from "path";
import EventDelegate from "../../prod/utils/EventDelegate";
import WSHelper from "../../prod/misc/WSHelper";
import { DevSocketMessageDataMap } from "../typings/devSocketTypings";

const devApp = express();
devApp.use(prodApp);

const devServer = http.createServer(devApp);
const wss = new NodeWebSocket.Server({ port: 8080 });

const failDelegate = new EventDelegate<string[]>();
const successDelegate = new EventDelegate<void>();

wss.on("connection", (ws, req) => {
	const wsHelper = new WSHelper<DevSocketMessageDataMap>(ws);

	function sendFail(errors: string[]): void {
		console.log(`========> sending failure to ${req.socket.remoteAddress}`);
		wsHelper.send("buildFail", errors);
	}

	function sendSuccess(): void {
		console.log(`========> sending success to ${req.socket.remoteAddress}`);
		wsHelper.send("buildSuccess");
	}

	failDelegate.listen(sendFail);
	successDelegate.listen(sendSuccess);

	ws.addEventListener("close", () => {
		failDelegate.stopListen(sendFail);
		successDelegate.stopListen(sendSuccess);
	});
});



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
		if (stats.hasErrors()) failDelegate.trigger(stats.compilation.errors.map(e => e.message));
		else successDelegate.trigger();
	});

devServer.listen(process.env.APP_PORT , () => {
	fs.emptyDirSync(path.resolve(process.cwd(), "dist"));
	console.log(`dev server running on port ${process.env.APP_PORT }`);
});
