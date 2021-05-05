
import "./index.style";

import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import { TimelineContext } from "./contexts";
import { FantasyEvent } from "./typings/appData";
import DataUtils from "./utils/DataUtils";
import { StateDelegate } from "./utils/EventDelegate";
import FantasyTimeState, { FantasyTimeStateOptions } from "./utils/FantasyTimeState";

const target = document.createElement("div");
document.body.append(target);

const START_TIME = FantasyTimeState.EPOCH_OFFSET + (new Date().getTime());
const TIMESTATE_OPTIONS: FantasyTimeStateOptions = {
	startTime: START_TIME,
};

ReactDOM.render(
	<TimelineContext.Provider
		value={new StateDelegate<FantasyEvent[]>([
			DataUtils.makeFantasyEvent({
				name: "red event",
				color: "red",
				startTime: START_TIME + FantasyTimeState.minuteToMS(0, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
			DataUtils.makeFantasyEvent({
				name: "orange event",
				color: "orange",
				startTime: START_TIME + FantasyTimeState.minuteToMS(1, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
			DataUtils.makeFantasyEvent({
				name: "yellow event",
				color: "yellow",
				startTime: START_TIME + FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
			DataUtils.makeFantasyEvent({
				name: "green event",
				color: "green",
				startTime: START_TIME + FantasyTimeState.minuteToMS(3, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
			DataUtils.makeFantasyEvent({
				name: "blue event",
				color: "blue",
				startTime: START_TIME + FantasyTimeState.minuteToMS(4, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
			DataUtils.makeFantasyEvent({
				name: "indigo event",
				color: "indigo",
				startTime: START_TIME + FantasyTimeState.minuteToMS(5, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
			DataUtils.makeFantasyEvent({
				name: "violet event",
				color: "violet",
				startTime: START_TIME + FantasyTimeState.minuteToMS(6, TIMESTATE_OPTIONS),
				duration: FantasyTimeState.minuteToMS(2, TIMESTATE_OPTIONS),
			}),
		])}>
		<FantasyTimeState.Provider
			options={TIMESTATE_OPTIONS}>
			<App />
		</FantasyTimeState.Provider>
	</TimelineContext.Provider>
	, target
);
