import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";

export interface ReadoutProps {
	className?: string;
}

function padTo2(num: number): string {
	let str = num + "";
	while(str.length < 2) str = `0${str}`;
	return str;
}

const Readout: React.FunctionComponent<ReadoutProps> = ({ className }) => {
	const { season, month, dayOfMonth, year, hour, minute, second } = FantasyTimeState.useFantasyTime(1000);
	const isAfternoon = hour > 12;
	return <div className={BEMUtils.className("Readout", { merge: [className] })}>
		({season}) {month} {dayOfMonth}, {year} @ {isAfternoon ? hour - 12 : hour}:{padTo2(minute)}:{padTo2(Math.floor(second))} {isAfternoon ? "PM" : "AM"}
	</div>;
};

Readout.displayName = "Readout";

export default React.memo(Readout);

import "./Readout.style";
