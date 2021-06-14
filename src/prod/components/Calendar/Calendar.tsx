import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import LoopUtils from "../../utils/LoopUtils";
import FantasyTimeState, { FantasyTimeStateData } from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";


export interface CalendarDayChildRendererData extends FantasyTimeStateData {
	inCurrentMonth: boolean;
	currentDay: boolean;
}

export interface CalendarDayProps {
	ms: number;
	currentMonthIndex: number;
	currentDayOfYear: number;
	currentYear: number;

	children?(data: CalendarDayChildRendererData): React.ReactElement;
}

const CalendarDay: React.FunctionComponent<CalendarDayProps> = React.memo(({ ms, children, currentMonthIndex, currentDayOfYear, currentYear }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const timeStateData: CalendarDayChildRendererData = ReactUtils.useTransformedValue(ms, ms => {
		const fTime = timeState.msToFantasyTime(ms);

		return {
			...fTime,
			currentDay: (fTime.year === currentYear) && (fTime.dayOfYear === currentDayOfYear),
			inCurrentMonth: currentMonthIndex === fTime.monthIndex,
		};
	});

	return children ? children(timeStateData) : null;
});

CalendarDay.displayName = "CalendarDay";

export interface CalendarProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children"> {
	ms: number;
	children?(data: CalendarDayChildRendererData): React.ReactElement;
}

const Calendar: React.FunctionComponent<CalendarProps> = React.memo(({ className, ms, children, ...divProps }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const { year, monthIndex, dayOfYear, dayOfMonth } = ReactUtils.useMakeValue(() => timeState.msToFantasyTime(ms), [ms]);

	const weeks = ReactUtils.useTransformedValue(ms, ms => {
		const days: number[] = [];

		const daysOfWeek = timeState.getDaysOfWeek();
		const daysInMonth = timeState.getMonthDayCount(monthIndex);
		const msPerDay = timeState.dayToMS(1);

		const firstDayOfMonthMS = ms - timeState.dayToMS(dayOfMonth - 1);
		const firstDayOfMonthDayOfWeekIndex = timeState.msToDayOfWeekIndex(firstDayOfMonthMS);

		const firstDayOfNextMonthMS = firstDayOfMonthMS + timeState.dayToMS(daysInMonth);
		const daysLeftInWeek = daysOfWeek.length - timeState.msToDayOfWeekIndex(firstDayOfNextMonthMS);

		LoopUtils.forNTimes(firstDayOfMonthDayOfWeekIndex, i => days.push(firstDayOfMonthMS + (i - firstDayOfMonthDayOfWeekIndex) * msPerDay));
		LoopUtils.forNTimes(daysInMonth, i => days.push(firstDayOfMonthMS + i * msPerDay));
		LoopUtils.forNTimes(daysLeftInWeek, i => days.push(firstDayOfNextMonthMS + i * msPerDay));

		const weeks: number[][] = [];
		LoopUtils.doWhile(() => {
			const week = days.splice(0, daysOfWeek.length);
			weeks.push(week);
			return days.length !== 0;
		});

		return weeks;
	});

	return <div
		{...divProps}
		className={BEMUtils.className("Calendar", { merge: [className] })}>
		{
			weeks.map((week, w) => <div key={w} className="Calendar__week">{
				week.map(
					(day, d) => <CalendarDay
						key={d}
						ms={day}
						currentYear={year}
						currentMonthIndex={monthIndex}
						currentDayOfYear={dayOfYear}>{children}</CalendarDay>
				)
			}</div>)
		}
	</div>;
});


export default Calendar;

import "./Calendar.style";

