import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import Calendar, { CalendarProps } from "../Calendar/Calendar";

export type AutoCalendarProps = Omit<CalendarProps, "ms">;

const AutoCalendar: React.FunctionComponent<AutoCalendarProps> = ({ className, ...calendarProps }) => {
	const [ms] = FantasyTimeState.useTime();

	return <Calendar
		ms={ms}
		{...calendarProps}
		className={BEMUtils.className("AutoCalendar", { merge: [className] })} />;
};

AutoCalendar.displayName = "AutoCalendar";

export default React.memo(AutoCalendar);

import "./AutoCalendar.style";
