import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";

export interface RelDatePickerProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children" | "onChange"> {
	value: number;
	onChange(value: number): void;
}

function getNum(val: string): number {
	const num = parseInt(val);
	if (isNaN(num)) return 0;
	else return num;
}

function keyDownEventToDiff(e: React.KeyboardEvent): number {
	switch (e.key) {
		case "ArrowUp":
			e.preventDefault();
			return 1;
		case "ArrowDown":
			e.preventDefault();
			return -1;
		default:
			return 0;
	}
}

const RelDatePicker: React.FunctionComponent<RelDatePickerProps> = ({ className, value, onChange, ...divProps }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const msRef = React.useRef(0);
	const [year, setYear] = React.useState(0);
	const [day, setDay] = React.useState(0);
	const [hour, setHour] = React.useState(0);
	const [minute, setMinute] = React.useState(0);
	const yearRef = React.createRef<HTMLInputElement>();
	const dayRef = React.createRef<HTMLInputElement>();
	const hourRef = React.createRef<HTMLInputElement>();
	const minuteRef = React.createRef<HTMLInputElement>();

	function updateMSRef(): void {
		msRef.current = timeState.yearToMS(year) + timeState.dayToMS(day) + timeState.hourToMS(hour) + timeState.minuteToMS(minute);
	}

	React.useEffect(() => {
		yearRef.current.style.width = "0px";
		yearRef.current.style.width = yearRef.current.scrollWidth + "px";
	}, [year]);

	React.useEffect(() => {
		dayRef.current.style.width = "0px";
		dayRef.current.style.width = dayRef.current.scrollWidth + "px";
	}, [day]);

	React.useEffect(() => {
		hourRef.current.style.width = "0px";
		hourRef.current.style.width = hourRef.current.scrollWidth + "px";
	}, [hour]);

	React.useEffect(() => {
		minuteRef.current.style.width = "0px";
		minuteRef.current.style.width = minuteRef.current.scrollWidth + "px";
	}, [minute]);

	React.useEffect(() => {
		updateMSRef();
		if (value !== msRef.current) onChange(msRef.current);
	}, [year, day, hour, minute]);

	React.useEffect(() => {
		if (value !== msRef.current) {
			let valLeft = value;
			const newYear = Math.floor(timeState.msToYear(valLeft));
			valLeft -= timeState.yearToMS(newYear);
			const newDay = Math.floor(timeState.msToDay(valLeft));
			valLeft -= timeState.dayToMS(newDay);
			const newHour = Math.floor(timeState.msToHour(valLeft));
			valLeft -= timeState.hourToMS(newHour);
			const newMinute = Math.floor(timeState.msToMinute(valLeft));

			setYear(newYear);
			setDay(newDay);
			setHour(newHour);
			setMinute(newMinute);
			msRef.current = value;
		}
	}, [value]);

	return <div
		{...divProps}
		className={BEMUtils.className("RelDatePicker", { merge: [className] })}>
		<input ref={yearRef} className="RelDatePicker__year" onKeyDown={e => setYear(year + keyDownEventToDiff(e))} value={year} onChange={e => setYear(getNum(e.currentTarget.value))} />y
		<input ref={dayRef} className="RelDatePicker__day" onKeyDown={e => setDay(day + keyDownEventToDiff(e))} value={day} onChange={e => setDay(getNum(e.currentTarget.value))} />d
		<input ref={hourRef} className="RelDatePicker__hour" onKeyDown={e => setHour(hour + keyDownEventToDiff(e))} value={hour} onChange={e => setHour(getNum(e.currentTarget.value))} />h
		<input ref={minuteRef} className="RelDatePicker__minute" onKeyDown={e => setMinute(minute + keyDownEventToDiff(e))} value={minute} onChange={e => setMinute(getNum(e.currentTarget.value))} />m
	</div>;
};

RelDatePicker.displayName = "RelDatePicker";

export default React.memo(RelDatePicker);

import "./RelDatePicker.style";
