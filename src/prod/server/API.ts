import express from "express";
import { ProdSocketMessageDataMap } from "../typings/prodSocketTypings";
import FantasyTimeState from "../utils/FantasyTimeState";
import TimeState, { TimeStateListener, TimeStatePlayingListener } from "../utils/TimeState";
import { WSSAssistantServer } from "ws-assistant-server";
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
const wss = new WSSAssistantServer<ProdSocketMessageDataMap>(8081);

const ts = new TimeState({
	updateMS: 1000,
	startTime: START_TIME,
	playOnInit: true,
});

wss.onConnected((client, ip) => {
	console.log(`${ip} connected to API`);

	client.send("full", {
		options: {},
		ms: ts.time,
		playing: ts.playing,
	});

	const playListener: TimeStatePlayingListener = playing => client.send("playing", playing);
	const msListener: TimeStateListener = ([ms]) => client.send("ms", ms);

	ts.addPlayingListener(playListener);
	ts.addListener(msListener);

	client.addMessageListener("playing", playing => {
		ts.setPlaying(playing);
		wss.sendToAllExcept("playing", [client], playing);
	});

	client.addEventListener("close", () => {
		console.log(`${ip} disconnected from API`);
		ts.removePlayingListener(playListener);
		ts.removeListener(msListener);
	});
});

export default app;
