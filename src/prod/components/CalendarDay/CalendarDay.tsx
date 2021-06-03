import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState, { FantasyTimeStateData } from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";

export interface CalendarDayChildRendererData extends FantasyTimeStateData {
	inCurrentMonth: boolean;
	currentDay: boolean;
}

export interface CalendarDayProps {
	className?: string;
	ms: number;
	currentMonthIndex: number;
	currentDayOfYear: number;
	currentYear: number;

	children?(data: CalendarDayChildRendererData): React.ReactNode;
}

const CalendarDay: React.FunctionComponent<CalendarDayProps> = ({ className, ms, children, currentMonthIndex, currentDayOfYear, currentYear }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const timeStateData: CalendarDayChildRendererData = ReactUtils.useTransformedValue(ms, ms => {
		const fTime = timeState.msToFantasyTime(ms);

		return {
			...fTime,
			currentDay: (fTime.year === currentYear) && (fTime.dayOfYear === currentDayOfYear),
			inCurrentMonth: currentMonthIndex === fTime.monthIndex,
		};
	});

	return <div className={BEMUtils.className("CalendarDay", { merge: [className], mods: { currentDay: timeStateData.currentDay, inCurrentMonth: timeStateData.inCurrentMonth } })}>
		{/* {children ? children(timeStateData) : null} */}
		{timeStateData.dayOfWeek[0]}<br />
		{timeStateData.dayOfYear}<br />
		{timeStateData.month} {timeStateData.dayOfMonth + 1}<br />
	</div>;
};

CalendarDay.displayName = "CalendarDay";

export default React.memo(CalendarDay);

import "./CalendarDay.style";
