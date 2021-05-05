import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState, { RelativeFantasyTimeStateData } from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";
import Icon from "../Icon/Icon";
import Timeline from "../Timeline/Timeline";

export interface AppProps {
	className?: string;
}

type SkipUnit = keyof RelativeFantasyTimeStateData;
const SKIP_UNITS: SkipUnit[] = ["millisecond", "second", "minute", "hour", "day", "year"];

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [msPerPixel, setMSPerPixel] = React.useState(timeState.minuteToMS(1) / 100);
	const [timelineFontSize, setTimelineFontSize] = React.useState(24);
	const dispMsPerPixel = ReactUtils.useAnimateValue(msPerPixel, 300);
	const playing = timeState.usePlaying();
	const [skipInterval, setSkipInterval] = React.useState(1);
	const [skipUnit, setSkipUnit] = React.useState<SkipUnit>("minute");

	return <div className={BEMUtils.className("App", { merge: [className] })}>
		<div className="App__sidebar">
			<button className="App__sidebar__button" onClick={() => setTimelineFontSize(timelineFontSize * 2)}><Icon icon="plus" /></button>
			<button className="App__sidebar__button" onClick={() => setTimelineFontSize(timelineFontSize / 2)}><Icon icon="minus" /></button>
		</div>
		<div className="App__toolbar">
			<button className="App__toolbar__button" onClick={() => setMSPerPixel(msPerPixel * 2)}><Icon icon="minus" /></button>
			<button className="App__toolbar__button" onClick={() => setMSPerPixel(msPerPixel / 2)}><Icon icon="plus" /></button>
			<div className="App__toolbar__divider" />
			<button className="App__toolbar__button" onClick={() => playing ? timeState.stop() : timeState.start()}>
				{playing ? <Icon icon="pause" /> : <Icon icon="play" />}
			</button>
			<div className="App__toolbar__skip">
				<input
					className="App__toolbar__skip__interval"
					type="number"
					value={skipInterval}
					onChange={e => {
						const val = parseFloat(e.target.value);
						if (!isNaN(val)) setSkipInterval(val);
					}} />
				<select
					className="App__toolbar__skip__unit"
					onChange={e => setSkipUnit(e.target.value as SkipUnit)}
					value={skipUnit}>
					{
						SKIP_UNITS.map(unit => <option value={unit} key={unit}>{unit}{skipInterval === 1 ? "" : "s"}</option>)
					}
				</select>
				<button
					className="App__toolbar__skip__button"
					onClick={() => {
						timeState.addFantasyTime({
							[skipUnit]: -skipInterval,
						});
					}}>
					<Icon icon="step-backward" />
				</button>
				<button
					className="App__toolbar__skip__button"
					onClick={() => {
						timeState.addFantasyTime({
							[skipUnit]: skipInterval,
						});
					}}>
					<Icon icon="step-forward" />
				</button>
			</div>
		</div>
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
