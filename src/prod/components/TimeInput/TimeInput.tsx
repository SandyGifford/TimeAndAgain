import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import { FantasyTimeFixedUnit } from "../../utils/FantasyTimeState";

const UNITS: FantasyTimeFixedUnit[] = ["millisecond", "second", "minute", "hour", "day", "year"];

export interface TimeInputProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children"> {
	inputProps?: Omit<React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "value" | "onChange" | "children" | "type">;
	selectProps?: Omit<React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>, "value" | "onChange" | "children">;
	unit: FantasyTimeFixedUnit;
	value: number;
	onUnitChange(unit: FantasyTimeFixedUnit): void;
	onValueChange(value: number): void;
}

const TimeInput: React.FunctionComponent<TimeInputProps> = ({
	className,
	inputProps: {
		min,
		className: inputClassName,
		...inputProps
	} = {},
	selectProps: {
		className: selectClassName,
		...selectProps
	} = {},
	unit,
	value,
	onUnitChange,
	onValueChange,
	...divProps
}) => {
	return <div
		{...divProps}
		className={BEMUtils.className("TimeInput", { merge: [className] })}>
		<input
			{...inputProps}
			className={BEMUtils.className("TimeInput__value", { merge: [inputClassName] })}
			type="number"
			min={typeof min === "number" ? min : 0}
			value={value}
			onChange={e => {
				const val = parseFloat(e.target.value);
				if (!isNaN(val)) onValueChange(val);
			}} />
		<select
			{...selectProps}
			className={BEMUtils.className("TimeInput__unit", { merge: [selectClassName] })}
			onChange={e => onUnitChange(e.target.value as FantasyTimeFixedUnit)}
			value={unit}>
			{
				UNITS.map(unit => <option value={unit} key={unit}>{unit}{value === 1 ? "" : "s"}</option>)
			}
		</select>
	</div>;
};

TimeInput.displayName = "TimeInput";

export default React.memo(TimeInput);

import "./TimeInput.style";
