import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import Readout from "../Readout/Readout";

export interface AppProps {
	className?: string;
}

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	const timeState = FantasyTimeState.useNewFantasyTimeState();
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
