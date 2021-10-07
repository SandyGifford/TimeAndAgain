
import "./index.style";

import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";

const target = document.createElement("div");
document.body.append(target);

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

ReactDOM.render(<App />, target);
