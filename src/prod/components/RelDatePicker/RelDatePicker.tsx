import * as React from "react";
import ReactUtils from "../../utils/ReactUtils";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState, { FantasyTimeFixedUnit } from "../../utils/FantasyTimeState";

export interface RelDatePickerProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children" | "onChange"> {
	value: number;
	onChange(value: number): void;
}

function parseNum(val: string): number {
	return processNum(parseInt(val));
}

function processNum(num: number): number {
	if (isNaN(num) || num < 0) return 0;
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

const UNITS = Object.freeze(["year", "day", "hour", "minute", "second"] as const);
type UsedUnits = Extract<FantasyTimeFixedUnit, typeof UNITS[number]>;

const RelDatePicker: React.FunctionComponent<RelDatePickerProps> = ({ className, value, onChange, ...divProps }) => {
	const id = ReactUtils.useUniqueId("RelDatePicker");

	const timeState = FantasyTimeState.useFantasyTimeState();
	// const msRef = React.useRef(value);
	const units = UNITS.reduce((map, unit) => {
		map[unit] = {
			state: React.useState(0),
			ref: React.useRef<HTMLInputElement>(),
		};

		return map;
	}, {} as Record<UsedUnits, {
		state: [number, React.Dispatch<React.SetStateAction<number>>],
		ref: React.MutableRefObject<HTMLInputElement>;
	}>);

	function getMSFromState(newState: Partial<Record<UsedUnits, number>> = {}): number {
		return UNITS.reduce((ms, unit) => {
			return ms + timeState.toMS(unit, typeof newState[unit] === "number" ? newState[unit] : units[unit].state[0]);
		}, 0);
	}

	React.useEffect(() => {
		let valLeft = value;

		UNITS.forEach(unit => {
			const newVal = Math.floor(timeState.msTo(unit, valLeft));
			valLeft -= timeState.toMS(unit, newVal);
			units[unit].state[1](newVal);
		});
	}, [value]);

	// React.useEffect(() => {
	// 	updateMSRefFromState();
	// 	if (value !== msRef.current) onChange(msRef.current);
	// }, UNITS.map(unit => units[unit].state[0]));

	UNITS.forEach(unit => {
		const { ref, state: [val] } = units[unit];
		React.useEffect(() => {
			ref.current.style.width = "0px";
			ref.current.style.width = ref.current.scrollWidth + "px";
		}, [val]);
	});

	return <div
		{...divProps}
		className={BEMUtils.className("RelDatePicker", { merge: [className] })}>
		{
			UNITS.map(unit => {
				const { ref, state: [val, setVal] } = units[unit];
				const inputId = `${id}__${unit}`;

				function change(newVal: number): void {
					setVal(newVal);
					onChange(getMSFromState({
						[unit]: newVal,
					}));
				}

				return <React.Fragment key={unit}>
					<input
						ref={ref}
						className="RelDatePicker__input"
						id={inputId}
						value={val}
						onKeyDown={e => change(processNum(val + keyDownEventToDiff(e)))}
						onChange={e => change(parseNum(e.currentTarget.value))} />
					<label className="RelDatePicker__label" htmlFor={inputId}>{unit[0]}</label>
				</React.Fragment>;
			})
		}
	</div>;
};

RelDatePicker.displayName = "RelDatePicker";

export default React.memo(RelDatePicker);

import "./RelDatePicker.style";
