import express from "express";
import prodApp from "../../prod/server/prodApp";
import webpack from "webpack";
import webpackConfig from "../webpack.config";
import http from "http";
import fs from "fs-extra";
import path from "path";
import { EventDelegate } from "event-delegate";
import { DevSocketMessageDataMap } from "../typings/devSocketTypings";
import { WSSAssistantServer } from "ws-assistant-server";

const devApp = express();
devApp.use(prodApp);

const devServer = http.createServer(devApp);
const wss = new WSSAssistantServer<DevSocketMessageDataMap>(8080);

const failDelegate = new EventDelegate<string[]>();
const successDelegate = new EventDelegate<void>();

wss.onConnected((client, ip) => {
	console.log(`${ip} connected to dev server`);

	function sendFail(errors: string[]): void {
		console.log(`========> sending failure to ${ip}`);
		client.send("buildFail", errors);
	}

	function sendSuccess(): void {
		console.log(`========> sending success to ${ip}`);
		client.send("buildSuccess");
	}

	failDelegate.listen(sendFail);
	successDelegate.listen(sendSuccess);

	client.addEventListener("close", () => {
		console.log(`${ip} disconnected from dev server`);
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
