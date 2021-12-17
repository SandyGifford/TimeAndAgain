import express from "express";
import NodeWebSocket from "ws";
import { ProdSocketMessageDataMap } from "../typings/prodSocketTypings";
import { EventDelegateListener } from "../utils/EventDelegate";
import FantasyTimeState from "../utils/FantasyTimeState";
import TimeState, { TimeStateListener } from "../utils/TimeState";
import WSHelperServer from "./WSHelperServer";

/*[ 
	{
		name: "red event",
		color: "red",
		startTime: START_TIME + FantasyTimeState.minuteToMS(0, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
	{
		name: "orange event",
		color: "orange",
		startTime: START_TIME + FantasyTimeState.minuteToMS(1, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
	{
		name: "yellow event",
		color: "yellow",
		startTime: START_TIME + FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
	{
		name: "green event",
		color: "green",
		startTime: START_TIME + FantasyTimeState.minuteToMS(3, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
	{
		name: "blue event",
		color: "blue",
		startTime: START_TIME + FantasyTimeState.minuteToMS(4, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
	{
		name: "indigo event",
		color: "indigo",
		startTime: START_TIME + FantasyTimeState.minuteToMS(5, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
	{
		name: "violet event",
		color: "violet",
		startTime: START_TIME + FantasyTimeState.minuteToMS(6, TIMESTATE_INIT),
		duration: FantasyTimeState.minuteToMS(2, TIMESTATE_INIT),
	},
].forEach(event => events.push(event)); */

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
