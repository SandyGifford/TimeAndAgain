import TimeState from "./TimeState";
import * as React from "react";

export interface FantasyTimeStateYearSegment {
	name: string;
	startDay: number;
}

export interface FantasyTimeStateOptions {
	secondsPerMinute?: number;
	minutesPerHour?: number;
	hoursPerDay?: number;
	daysPerYear?: number;
	months?: FantasyTimeStateYearSegment[];
	seasons?: FantasyTimeStateYearSegment[];
	daysOfWeek?: string[];
	startTime?: number | EssentialFantasyTimeStateData;
}

export interface RelativeFantasyTimeStateData {
	millisecond?: number;
	second?: number;
	minute?: number;
	hour?: number;
	day?: number;
	year?: number;
}
export interface EssentialFantasyTimeStateData {
	second: number;
	minute: number;
	hour: number;
	dayOfYear: number;
	year: number;
}

export interface FantasyTimeStateData extends EssentialFantasyTimeStateData {
	epoch: number;
	dayOfMonth: number;
	monthIndex: number;
	month: string;
	seasonIndex: number;
	season: string;
	dayOfWeek: string;
	dayOfWeekIndex: number;
}

const fantasyTimeStateDefaultMonths: FantasyTimeStateYearSegment[] = [
	/* 0 */ { name: "January", startDay: 0 },
	/* 1 */ { name: "February", startDay: 31 },
	/* 2 */ { name: "March", startDay: 28 + 31 }, // spring
	/* 3 */ { name: "April", startDay: 31 + 28 + 31 },
	/* 4 */ { name: "May", startDay: 30 + 31 + 28 + 31 },
	/* 5 */ { name: "June", startDay: 31 + 30 + 31 + 28 + 31 }, // summer
	/* 6 */ { name: "July", startDay: 30 + 31 + 30 + 31 + 28 + 31 },
	/* 7 */ { name: "August", startDay: 31 + 30 + 31 + 30 + 31 + 28 + 31 },
	/* 8 */ { name: "September", startDay: 31 + 31 + 30 + 31 + 30 + 31 + 28 + 31 }, // fall
	/* 9 */ { name: "October", startDay: 30 + 31 + 31 + 30 + 31 + 30 + 31 + 28 + 31 },
	/* 10 */ { name: "November", startDay: 31 + 30 + 31 + 31 + 30 + 31 + 30 + 31 + 28 + 31 },
	/* 11 */ { name: "December", startDay: 30 + 31 + 30 + 31 + 31 + 30 + 31 + 30 + 31 + 28 + 31 }, // winter
];

const fantasyTimeStateDefaultSeasons: FantasyTimeStateYearSegment[] = [
	{ name: "spring", startDay: fantasyTimeStateDefaultMonths[2].startDay },
	{ name: "summer", startDay: fantasyTimeStateDefaultMonths[5].startDay },
	{ name: "fall", startDay: fantasyTimeStateDefaultMonths[8].startDay },
	{ name: "winter", startDay: fantasyTimeStateDefaultMonths[11].startDay },
];

const DEFAULT_OPTIONS: Required<FantasyTimeStateOptions> = {
	startTime: 0,
	secondsPerMinute: 60,
	minutesPerHour: 60,
	hoursPerDay: 24,
	daysPerYear: 365.2526,
	months: fantasyTimeStateDefaultMonths,
	seasons: fantasyTimeStateDefaultSeasons,
	daysOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
};

export type FantasyTimeFixedUnit = keyof RelativeFantasyTimeStateData;

function findYearSegmentIndex(dayOfYear: number, segments: FantasyTimeStateYearSegment[]): number {
	return segments.findIndex((segment, i) => {
		if (segments[i + 1]) return (dayOfYear - 1) >= segment.startDay && (dayOfYear - 1) < segments[i + 1].startDay;
		else return true;
	});
}

export default class FantasyTimeState extends TimeState {
	public static get EPOCH_OFFSET(): number {
		return FantasyTimeState.yearToMS(1970, DEFAULT_OPTIONS);
	}

	protected static fantasyContext = React.createContext<FantasyTimeState>(null);

	public static useNewFantasyTimeState(options?: Partial<FantasyTimeStateOptions>): FantasyTimeState {
		const firstFrame = React.useRef(true);
		const state = React.useRef(firstFrame.current ? new FantasyTimeState(options) : null);
		firstFrame.current = false;
		return state.current;
	}

	public static fantasyTimeToMS(fTime: EssentialFantasyTimeStateData, options?: FantasyTimeStateOptions): number {
		options = FantasyTimeState.completeOptions(options);

		return (
			FantasyTimeState.yearToMS(fTime.year, options) +
			FantasyTimeState.dayToMS(fTime.dayOfYear, options) +
			FantasyTimeState.hourToMS(fTime.hour, options) +
			FantasyTimeState.minuteToMS(fTime.minute, options) +
			FantasyTimeState.secondToMS(fTime.second)
		);
	}

	public static msToFantasyTime(ms: number, options?: FantasyTimeStateOptions): FantasyTimeStateData {
		const { hoursPerDay, daysPerYear, months, seasons, daysOfWeek } = FantasyTimeState.completeOptions(options);
		let remainingMS = ms;
		const msPerDay = FantasyTimeState.hourToMS(hoursPerDay, options);
		const msPerYear = msPerDay * daysPerYear;

		const year = Math.floor(ms / msPerYear);
		remainingMS -= year * msPerYear;

		const dayOfYear = Math.floor(remainingMS / msPerDay);
		remainingMS -= dayOfYear * msPerDay;

		const hour = Math.floor(FantasyTimeState.msToHour(remainingMS, options));
		remainingMS -= FantasyTimeState.hourToMS(hour, options);

		const minute = Math.floor(FantasyTimeState.msToMinute(remainingMS, options));
		remainingMS -= FantasyTimeState.minuteToMS(minute, options);

		const second = FantasyTimeState.msToSecond(remainingMS);

		const monthIndex = findYearSegmentIndex(dayOfYear, months);
		const seasonIndex = findYearSegmentIndex(dayOfYear, seasons);

		const dayOfMonth = dayOfYear - months[monthIndex].startDay;
		const dayOfWeekIndex = Math.floor(ms / msPerDay) % daysOfWeek.length;

		return {
			epoch: ms,
			year,
			dayOfMonth,
			dayOfYear,
			hour,
			minute,
			second,
			monthIndex,
			seasonIndex,
			month: options.months[monthIndex].name,
			season: options.seasons[seasonIndex].name,
			dayOfWeek: daysOfWeek[dayOfWeekIndex],
			dayOfWeekIndex,
		};
	}

	public static useFantasyTimeState(): FantasyTimeState {
		return React.useContext(FantasyTimeState.fantasyContext as any);
	}

	public static useFantasyTime(precision?: number): FantasyTimeStateData {
		const state = FantasyTimeState.useFantasyTimeState();
		return state.useFantasyTime(precision);
	}

	public static getMonthDayCount(monthIndex: number, options: FantasyTimeStateOptions = {}): number {
		const months = (options.months || DEFAULT_OPTIONS.months);
		const daysPerYear = (options.daysPerYear || DEFAULT_OPTIONS.daysPerYear);
		const month = months[monthIndex];
		const nextMonth = months[monthIndex + 1];
		return (nextMonth ? nextMonth.startDay : daysPerYear) - month.startDay;
	}

	public static msTo(unit: FantasyTimeFixedUnit, ms: number, options?: FantasyTimeStateOptions): number {
		switch(unit) {
			case "millisecond":
				return ms;
			case "second":
				return FantasyTimeState.msToSecond(ms);
			case "minute":
				return FantasyTimeState.msToMinute(ms, options);
			case "hour":
				return FantasyTimeState.msToHour(ms, options);
			case "day":
				return FantasyTimeState.msToDay(ms, options);
			case "year":
				return FantasyTimeState.msToYear(ms, options);
		}
	}

	public static msToSecond = (ms: number): number => ms / 1000;
	public static msToMinute = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToSecond(ms || 0) / (options.secondsPerMinute || DEFAULT_OPTIONS.secondsPerMinute);
	public static msToHour = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToMinute(ms || 0, options) / (options.minutesPerHour || DEFAULT_OPTIONS.minutesPerHour);
	public static msToDay = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToHour(ms || 0, options) / (options.hoursPerDay || DEFAULT_OPTIONS.hoursPerDay);
	public static msToYear = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToDay(ms || 0, options) / (options.daysPerYear || DEFAULT_OPTIONS.daysPerYear);
	public static msToDayOfWeekIndex = (ms: number, options: FantasyTimeStateOptions = {}): number => {
		const daysOfWeek = options.daysOfWeek || DEFAULT_OPTIONS.daysOfWeek;
		return Math.floor(FantasyTimeState.msToDay(ms, options)) % daysOfWeek.length;
	};
	public static msToDayOfWeek = (ms: number, options: FantasyTimeStateOptions = {}): string => {
		const daysOfWeek = options.daysOfWeek || DEFAULT_OPTIONS.daysOfWeek;
		return daysOfWeek[FantasyTimeState.msToDayOfWeekIndex(ms, options)];
	};

	public static toMS(unit: FantasyTimeFixedUnit, val: number, options?: FantasyTimeStateOptions): number {
		switch(unit) {
			case "millisecond":
				return val;
			case "second":
				return FantasyTimeState.secondToMS(val);
			case "minute":
				return FantasyTimeState.minuteToMS(val, options);
			case "hour":
				return FantasyTimeState.hourToMS(val, options);
			case "day":
				return FantasyTimeState.dayToMS(val, options);
			case "year":
				return FantasyTimeState.yearToMS(val, options);
		}
	}

	public static secondToMS = (seconds: number): number => seconds * 1000;
	public static minuteToMS = (minutes: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.secondToMS(minutes || 0) * (options.secondsPerMinute || DEFAULT_OPTIONS.secondsPerMinute);
	public static hourToMS = (hours: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.minuteToMS(hours || 0, options) * (options.minutesPerHour || DEFAULT_OPTIONS.minutesPerHour);
	public static dayToMS = (days: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.hourToMS(days || 0, options) * (options.hoursPerDay || DEFAULT_OPTIONS.hoursPerDay);
	public static yearToMS = (years: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.dayToMS(years || 0, options) * (options.daysPerYear || DEFAULT_OPTIONS.daysPerYear);

	public static Provider(props: {children: React.ReactNode, options?: FantasyTimeStateOptions}): React.ReactElement {
		const state = FantasyTimeState.useNewFantasyTimeState(props.options);
		return state.Provider(props);
	}

	private static completeRelative(fTime: RelativeFantasyTimeStateData): Required<RelativeFantasyTimeStateData> {
		return {
			millisecond: 0,
			second: 0,
			minute: 0,
			hour: 0,
			day: 0,
			year: 0,
			...fTime,
		};
	}

	private static relativeToEssential(fTime: RelativeFantasyTimeStateData): EssentialFantasyTimeStateData {
		const { millisecond, day, second, ...rest } = FantasyTimeState.completeRelative(fTime);
		return {
			...rest,
			dayOfYear: day,
			second: second + FantasyTimeState.msToSecond(millisecond),
		};
	}

	private static completeOptions(options?: Partial<FantasyTimeStateOptions>): Required<FantasyTimeStateOptions> {
		return {
			...DEFAULT_OPTIONS as Required<FantasyTimeStateOptions>,
			...options,
		};
	}

	private options: FantasyTimeStateOptions;

	constructor(options: FantasyTimeStateOptions = {}) {
		super(
			typeof options.startTime === "object" ?
				FantasyTimeState.fantasyTimeToMS(options.startTime) :
				(options.startTime || 0)
		);

		this.options = FantasyTimeState.completeOptions(options);
	}

	public setOptions = (options: FantasyTimeStateOptions): void => {
		this.options = options;
	};

	public getMonths = (): FantasyTimeStateYearSegment[] => {
		return this.options.months.map(month => ({ ...month }));
	};

	public getDaysOfWeek = (): string[] => {
		return [...this.options.daysOfWeek];
	};

	public useFantasyTime(precision?: number): FantasyTimeStateData {
		const [ms] = this.useTime(precision);
		return this.msToFantasyTime(ms);
	}

	public getMonthDayCount = (monthIndex: number): number => FantasyTimeState.getMonthDayCount(monthIndex, this.options);

	public msTo = (unit: FantasyTimeFixedUnit, ms: number): number => FantasyTimeState.msTo(unit, ms, this.options);
	public msToSecond = (ms: number): number => FantasyTimeState.msToSecond(ms);
	public msToMinute = (ms: number): number => FantasyTimeState.msToMinute(ms, this.options);
	public msToHour = (ms: number): number => FantasyTimeState.msToHour(ms, this.options);
	public msToDay = (ms: number): number => FantasyTimeState.msToDay(ms, this.options);
	public msToYear = (ms: number): number => FantasyTimeState.msToYear(ms, this.options);
	public msToDayOfWeekIndex = (ms: number): number => FantasyTimeState.msToDayOfWeekIndex(ms, this.options);
	public msToDayOfWeek = (ms: number): string => FantasyTimeState.msToDayOfWeek(ms, this.options);

	public toMS = (unit: FantasyTimeFixedUnit, val: number): number => FantasyTimeState.toMS(unit, val, this.options);
	public secondToMS = (seconds: number): number => FantasyTimeState.secondToMS(seconds);
	public minuteToMS = (minutes: number): number => FantasyTimeState.minuteToMS(minutes, this.options);
	public hourToMS = (hours: number): number => FantasyTimeState.hourToMS(hours, this.options);
	public dayToMS = (days: number): number => FantasyTimeState.dayToMS(days, this.options);
	public yearToMS = (years: number): number => FantasyTimeState.yearToMS(years, this.options);

	public setFantasyTime(fTime: RelativeFantasyTimeStateData): void {
		this.setTime(this.fantasyTimeToMS(FantasyTimeState.relativeToEssential(fTime)));
	}

	public addFantasyTime(fTime: RelativeFantasyTimeStateData): void {
		this.addTime(this.fantasyTimeToMS(FantasyTimeState.relativeToEssential(fTime)));
	}

	public msToFantasyTime(milliseconds: number): FantasyTimeStateData {
		return FantasyTimeState.msToFantasyTime(milliseconds, this.options);
	}

	public fantasyTimeToMS(fTime: EssentialFantasyTimeStateData): number {
		return FantasyTimeState.fantasyTimeToMS(fTime, this.options);
	}

	public Provider = (props: {children: React.ReactNode}): React.ReactElement => {
		const { fantasyContext: Context } = FantasyTimeState;
		return <Context.Provider value={this as any}>{props.children}</Context.Provider>;
	};
}
