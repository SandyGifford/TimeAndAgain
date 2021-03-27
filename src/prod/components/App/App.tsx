import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import Readout from "../Readout/Readout";

export interface AppProps {
	className?: string;
}

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	return <div
		className={BEMUtils.className("App", { merge: [className] })}>
		<Readout />
	</div>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
