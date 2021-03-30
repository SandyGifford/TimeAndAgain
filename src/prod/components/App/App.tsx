import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import Timeline from "../Timeline/Timeline";

export interface AppProps {
	className?: string;
}

const App: React.FunctionComponent<AppProps> = ({ className }) => {
	return <div
		className={BEMUtils.className("App", { merge: [className] })}>
		<Timeline />
	</div>;
};

App.displayName = "App";

export default React.memo(App);

import "./App.style";
