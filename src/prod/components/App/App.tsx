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
	const dispMsPerPixel = ReactUtils.useAnimateValue(msPerPixel, 300);

	return <div
		className={BEMUtils.className("App", { merge: [className] })}>
		<div className="App__controls">
			<button className="App__controls__button" onClick={() => setMSPerPixel(msPerPixel * 2)}>-</button>
			<button className="App__controls__button" onClick={() => setMSPerPixel(msPerPixel / 2)}>+</button>
		</div>
		<Timeline className="App__timeline" msPerPixel={dispMsPerPixel} />
	</div>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
