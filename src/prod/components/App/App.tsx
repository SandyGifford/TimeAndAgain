import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import Readout from "../Readout/Readout";

export interface AppProps {
	className?: string;
}

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	const timeState = FantasyTimeState.useNewFantasyTimeState({
		daysPerYear: 8,
		secondsPerMinute: 2,
		minutesPerHour: 2,
		hoursPerDay: 2,
		months: [
			{ name: "First", startDay: 0 },
			{ name: "Second", startDay: 2 },
			{ name: "Third", startDay: 4 },
			{ name: "Forth", startDay: 6 },
		],
		seasons: [{ name: "the only season", startDay: 0 }],
	});
	const playing = timeState.usePlaying();

	return <timeState.Provider>
		<div
			className={BEMUtils.className("App", { merge: [className], mods: { playing } })}
			onClick={() => playing ? timeState.stop() : timeState.start()}>
			<Readout />
		</div>
	</timeState.Provider>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
