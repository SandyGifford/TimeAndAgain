import * as React from "react";
import { TimelineContext } from "../../contexts";
import BEMUtils from "../../utils/BEMUtils";
import DataUtils from "../../utils/DataUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";
import Icon from "../Icon/Icon";
import RelDatePicker from "../RelDatePicker/RelDatePicker";
import Timeline from "../Timeline/Timeline";
import Toolbar from "../Toolbar/Toolbar";
import ToolbarGroup from "../ToolbarGroup/ToolbarGroup";

export interface AppProps {
	className?: string;
}

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [msPerPixel, setMSPerPixel] = React.useState(timeState.minuteToMS(1) / 100);
	const [timelineFontSize, setTimelineFontSize] = React.useState(24);
	const dispMsPerPixel = ReactUtils.useAnimateValue(msPerPixel, 300);
	const playing = timeState.usePlaying();
	const [skipTime, setSkipTime] = React.useState(timeState.minuteToMS(1));
	const [newEventDuration, setNewEventDuration] = React.useState(timeState.minuteToMS(1));
	const [newEventName, setNewEventName] = React.useState("");
	const timelineCtx = React.useContext(TimelineContext);

	function newEvent(): void {
		timelineCtx.push({
			color: DataUtils.randomColor(),
			duration: newEventDuration,
			name: newEventName,
			startTime: timeState.time,
		});
		setNewEventName("");
	}

	return <div className={BEMUtils.className("App", { merge: [className] })}>
		<div className="App__sidebar">
			<button className="App__sidebar__button" onClick={() => setTimelineFontSize(timelineFontSize * 2)}><Icon icon="plus" /></button>
			<button className="App__sidebar__button" onClick={() => setTimelineFontSize(timelineFontSize / 2)}><Icon icon="minus" /></button>
		</div>
		<Toolbar className="App__toolbar">
			<ToolbarGroup header="timescale">
				<button onClick={() => setMSPerPixel(msPerPixel * 2)}><Icon icon="minus" /></button>
				<button onClick={() => setMSPerPixel(msPerPixel / 2)}><Icon icon="plus" /></button>
			</ToolbarGroup>
			<ToolbarGroup>
				<button onClick={() => playing ? timeState.stop() : timeState.start()}>
					{playing ? <Icon icon="pause" /> : <Icon icon="play" />}
				</button>
			</ToolbarGroup>
			<ToolbarGroup header="skip controls">
				<RelDatePicker
					value={skipTime}
					onChange={setSkipTime} />
				<button
					onClick={() => timeState.addTime(-skipTime)}>
					<Icon icon="step-backward" />
				</button>
				<button
					onClick={() => timeState.addTime(skipTime)}>
					<Icon icon="step-forward" />
				</button>
			</ToolbarGroup>
			<ToolbarGroup header="quick event">
				<RelDatePicker
					value={newEventDuration}
					onChange={setNewEventDuration} />
				<input
					onKeyDown={e => {
						switch (e.key) {
							case "Enter":
								newEvent();
								break;
						}
					}}
					value={newEventName}
					placeholder="event name..."
					onChange={e => setNewEventName(e.target.value)} />
				<button
					disabled={!newEventName}
					onClick={newEvent}>
					Make event
				</button>
			</ToolbarGroup>
		</Toolbar>
		<Timeline
			className="App__timeline"
			style={{
				fontSize: timelineFontSize,
			}}
			msPerPixel={dispMsPerPixel} />
	</div>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
