import * as React from "react";
import { TimelineContext } from "../../contexts";
import { FantasyEvent } from "../../typings/appData";
import { ProdSocketMessageDataMap } from "../../typings/prodSocketTypings";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";
import UIListDelegate from "../../utils/UIListDelegate";
import AutoCalendar from "../AutoCalendar/AutoCalendar";
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
	const timeState = ReactUtils.useMakeOnce(() => new FantasyTimeState());
	const [msPerPixel, setMSPerPixel] = React.useState(timeState.minuteToMS(1) / 100);
	const [timelineFontSize, setTimelineFontSize] = React.useState(24);
	const dispMsPerPixel = ReactUtils.useAnimateValue(msPerPixel, 300);
	const playing = timeState.usePlaying();
	const [skipTime, setSkipTime] = React.useState(timeState.minuteToMS(1));
	const events = React.useRef(new UIListDelegate<FantasyEvent>()).current;

	const ws = ReactUtils.useWS<ProdSocketMessageDataMap>(`ws://${location.hostname}:8081`);

	React.useEffect(() => {
		ws.addMessageListener("full", ({ ms, playing, options }) => {
			timeState.setTime(ms);
			timeState.setPlaying(playing);
			timeState.setOptions(options);
		});
		ws.addMessageListener("ms", ms => timeState.setTime(ms));
	}, []);

	return <TimelineContext.Provider
		value={events}>
		<timeState.Provider>
			<div className={BEMUtils.className("App", { merge: [className] })}>
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
					<AutoCalendar
						className="App__lower__calendar"
						weekClassName="App__lower__calendar__week">
						{
							({ month, dayOfMonth, dayOfWeek, year, dayOfYear, inCurrentMonth, currentDay }) => <div className={BEMUtils.className("App__lower__calendar__week__day", { mods: { inCurrentMonth, currentDay } })}>{month} {dayOfMonth} {year}<br />{dayOfYear}<br />{dayOfWeek}</div>
						}
					</AutoCalendar>
				</div>
			</div>
		</timeState.Provider>
	</TimelineContext.Provider>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
