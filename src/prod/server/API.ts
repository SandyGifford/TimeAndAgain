import express from "express";
import NodeWebSocket from "ws";
import { ProdSocketMessageDataMap } from "../typings/prodSocketTypings";
import { EventDelegateListener } from "../utils/EventDelegate";
import FantasyTimeState from "../utils/FantasyTimeState";
import TimeState, { TimeStateListener } from "../utils/TimeState";
import WSHelperServer from "./WSHelperServer";

const START_TIME = FantasyTimeState.EPOCH_OFFSET + (new Date().getTime());

const app = express();
const wss = new NodeWebSocket.Server({ port: 8081 });

const ts = new TimeState({
	updateMS: 1000,
	startTime: START_TIME,
	playOnInit: true,
});

app.post("play", () => ts.start());
app.post("stop", () => ts.stop());

wss.on("connection", (ws, req) => {
	const wsHelper = new WSHelperServer<ProdSocketMessageDataMap>(ws);

	wsHelper.send("full", {
		options: {},
		ms: ts.time,
		playing: ts.playing,
	});

	const playListener: EventDelegateListener<boolean> = playing => wsHelper.send("playing", playing);
	const msListener: TimeStateListener = ([ms]) => wsHelper.send("ms", ms);

	ts.addPlayingListener(playListener);
	ts.addListener(msListener);

	ws.addEventListener("close", () => {
		ts.removePlayingListener(playListener);
		ts.removeListener(msListener);
	});
});

export default app;
