import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";

export interface ReadoutProps {
	className?: string;
}

const Readout: React.FunctionComponent<ReadoutProps> = ({ className }) => {
	const time = FantasyTimeState.useFantasyTime(1000);
	return <div className={BEMUtils.className("Readout", { merge: [className] })}>
		<div>year: {time.year}</div>
		<div>dayOfYear: {time.dayOfYear}</div>
		<div>hour: {time.hour}</div>
		<div>minute: {time.minute}</div>
		<div>second: {Math.floor(time.second)}</div>
		<div>month: {time.month}</div>
		<div>season: {time.season}</div>
	</div>;
};

Readout.displayName = "Readout";

export default React.memo(Readout);

import "./Readout.style";
