import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";
import Timeline from "../Timeline/Timeline";

export interface AppProps {
	className?: string;
}

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [msPerPixel, setMSPerPixel] = React.useState(timeState.minuteToMS(1) / 100);
	const [timelineFontSize, setTimelineFontSize] = React.useState(12);
	const dispMsPerPixel = ReactUtils.useAnimateValue(msPerPixel, 300);
	const playing = timeState.usePlaying();

	return <div className={BEMUtils.className("App", { merge: [className] })}>
		<div className="App__sidebar">
			<button className="App__sidebar__button" onClick={() => setTimelineFontSize(timelineFontSize / 2)}>-</button>
			<button className="App__sidebar__button" onClick={() => setTimelineFontSize(timelineFontSize * 2)}>+</button>
		</div>
		<div className="App__toolbar">
			<button className="App__toolbar__button" onClick={() => setMSPerPixel(msPerPixel * 2)}>-</button>
			<button className="App__toolbar__button" onClick={() => setMSPerPixel(msPerPixel / 2)}>+</button>
			<div className="App__toolbar__divider" />
			<button className="App__toolbar__button" onClick={() => playing ? timeState.stop() : timeState.start()}>{playing ? "▮▮" : "▶"}</button>
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
