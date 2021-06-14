import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";
import Calendar from "../Calendar/Calendar";
import Icon from "../Icon/Icon";
import QuickEvent from "../QuickEvent/QuickEvent";
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
				<QuickEvent />
			</ToolbarGroup>
		</Toolbar>
		<Timeline
			className="App__timeline"
			style={{
				fontSize: timelineFontSize,
			}}
			msPerPixel={dispMsPerPixel} />
		<div className="App__lower">
			<Calendar ms={timeState.time} className="App__lower__calendar">{
				({ month, dayOfMonth, dayOfWeek, year, dayOfYear, inCurrentMonth, currentDay }) => <div className={BEMUtils.className("App__lower__calendar__day", { mods: { inCurrentMonth, currentDay } })}>{month} {dayOfMonth} {year}<br />{dayOfYear}<br />{dayOfWeek}</div>
			}</Calendar>
		</div>
	</div>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
