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
	monthNumber: number;
	month: string;
	seasonNumber: number;
	season: string;
	dayOfWeek: string;
	dayOfWeekNumber: number;
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

function findYearSegmentIndex(dayOfYear: number, segments: FantasyTimeStateYearSegment[]): number {
	return segments.findIndex((segment, i) => {
		if (segments[i + 1]) return dayOfYear >= segment.startDay && dayOfYear < segments[i + 1].startDay;
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
			monthNumber: monthIndex + 1,
			seasonNumber: seasonIndex + 1,
			month: options.months[monthIndex].name,
			season: options.seasons[seasonIndex].name,
			dayOfWeek: daysOfWeek[dayOfWeekIndex],
			dayOfWeekNumber: dayOfWeekIndex + 1,
		};
	}

	public static useFantasyTimeState(): FantasyTimeState {
		return React.useContext(FantasyTimeState.fantasyContext as any);
	}

	public static useFantasyTime(precision?: number): FantasyTimeStateData {
		const state = FantasyTimeState.useFantasyTimeState();
		return state.useFantasyTime(precision);
	}

	public static msToSecond = (ms: number): number => ms / 1000;
	public static msToMinute = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToSecond(ms || 0) / (options.secondsPerMinute || DEFAULT_OPTIONS.secondsPerMinute);
	public static msToHour = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToMinute(ms || 0, options) / (options.minutesPerHour || DEFAULT_OPTIONS.minutesPerHour);
	public static msToDay = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToHour(ms || 0, options) / (options.hoursPerDay || DEFAULT_OPTIONS.hoursPerDay);
	public static msToYear = (ms: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.msToDay(ms || 0, options) / (options.daysPerYear || DEFAULT_OPTIONS.daysPerYear);

	public static secondToMS = (seconds: number): number => seconds * 1000;
	public static minuteToMS = (minutes: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.secondToMS(minutes || 0) * (options.secondsPerMinute || DEFAULT_OPTIONS.secondsPerMinute);
	public static hourToMS = (hours: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.minuteToMS(hours || 0, options) * (options.minutesPerHour || DEFAULT_OPTIONS.minutesPerHour);
	public static dayToMS = (days: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.hourToMS(days || 0, options) * (options.hoursPerDay || DEFAULT_OPTIONS.hoursPerDay);
	public static yearToMS = (years: number, options: FantasyTimeStateOptions = {}): number => FantasyTimeState.dayToMS(years || 0, options) * (options.daysPerYear || DEFAULT_OPTIONS.daysPerYear);

	public static Provider(props: {children: React.ReactNode, options?: FantasyTimeStateOptions}): React.ReactElement {
		const state = FantasyTimeState.useNewFantasyTimeState(props.options);
		return state.Provider(props);
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

	public useFantasyTime(precision?: number): FantasyTimeStateData {
		const ms = this.useTime(precision);
		return this.msToFantasyTime(ms);
	}

	public msToSecond = (ms: number): number => FantasyTimeState.msToSecond(ms);
	public msToMinute = (ms: number): number => FantasyTimeState.msToMinute(ms, this.options);
	public msToHour = (ms: number): number => FantasyTimeState.msToHour(ms, this.options);
	public msToDay = (ms: number): number => FantasyTimeState.msToDay(ms, this.options);
	public msToYear = (ms: number): number => FantasyTimeState.msToYear(ms, this.options);

	public secondToMS = (seconds: number): number => FantasyTimeState.secondToMS(seconds);
	public minuteToMS = (minutes: number): number => FantasyTimeState.minuteToMS(minutes, this.options);
	public hourToMS = (hours: number): number => FantasyTimeState.hourToMS(hours, this.options);
	public dayToMS = (days: number): number => FantasyTimeState.dayToMS(days, this.options);
	public yearToMS = (years: number): number => FantasyTimeState.yearToMS(years, this.options);

	public msToFantasyTime(milliseconds): FantasyTimeStateData {
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
