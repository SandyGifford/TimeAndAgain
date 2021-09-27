
import "./index.style";

import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import { TimelineContext } from "./contexts";
import { FantasyEvent } from "./typings/appData";
import FantasyTimeState, { FantasyTimeStateInit } from "./utils/FantasyTimeState";
import UIListDelegate from "./utils/UIListDelegate";

const target = document.createElement("div");
document.body.append(target);

const START_TIME = FantasyTimeState.EPOCH_OFFSET + (new Date().getTime());
const TIMESTATE_INIT: FantasyTimeStateInit = {
	startTime: START_TIME,
};

const events = new UIListDelegate<FantasyEvent>();

[
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
].forEach(event => events.push(event));

ReactDOM.render(
	<TimelineContext.Provider
		value={events}>
		<FantasyTimeState.Provider
			options={TIMESTATE_INIT}>
			<App />
		</FantasyTimeState.Provider>
	</TimelineContext.Provider>
	, target
);
