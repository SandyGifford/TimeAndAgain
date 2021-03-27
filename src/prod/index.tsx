import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";
import FantasyTimeState from "./utils/FantasyTimeState";

const target = document.createElement("div");
document.body.append(target);

ReactDOM.render(<FantasyTimeState.Provider
	options={{
		startTime: FantasyTimeState.EPOCH_OFFSET + (new Date().getTime()),
	}}>
	<App />
</FantasyTimeState.Provider>, target);
