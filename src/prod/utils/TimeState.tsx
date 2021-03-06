import * as React from "react";
import { StateDelegate } from "./EventDelegate";

export type TimeStateTime = [number, number];
export type TimeStateListener = (time: TimeStateTime) => void;

interface TimeStateHandler {
	precision?: number;
	lastTime: number;
	listener: TimeStateListener;
}

export default class TimeState {
	protected static context = React.createContext<TimeState>(null);

	public static useNewTimeState(startTime?: number): TimeState {
		const firstFrame = React.useRef(true);
		const state = React.useRef(firstFrame.current ? new TimeState(startTime) : null);
		firstFrame.current = false;
		return state.current;
	}

	public static Provider(props: {children: React.ReactNode}): React.ReactElement {
		const state = TimeState.useNewTimeState();
		return state.Provider(props);
	}

	public static useTimeState(): TimeState {
		return React.useContext(TimeState.context);
	}

	public static useListener(listener: TimeStateListener, precision?: number): void {
		const state = TimeState.useTimeState();
		state.useListener(listener, precision);
	}

	public static useTime(precision?: number): TimeStateTime {
		const state = TimeState.useTimeState();
		return state.useTime(precision);
	}

	public static usePlaying(): boolean {
		const state = TimeState.useTimeState();
		return state.usePlaying();
	}

	public get playing() : boolean {
		return this.playingDelegate.value;
	}

	public get time() : number {
		return this.accumulatedTime;
	}

	private handlers: TimeStateHandler[] = [];
	private frameRef: number;
	private playingDelegate = new StateDelegate(false);
	private accumulatedTime = 0;
	private lastTime = 0;

	constructor(startTime?: number) {
		this.accumulatedTime = startTime;
	}

	public addTime = (ms: number): void => {
		this.setTime(this.accumulatedTime + ms);
	};

	public setTime = (ms: number): void => {
		this.trigger(ms);
	};

	public useTime = (precision = 0): TimeStateTime => {
		const [time, setTime] = React.useState<TimeStateTime>([this.time, 0]);
		const listener = React.useCallback<TimeStateListener>(time => setTime(time), []);
		this.useListener(listener, precision);
		return time;
	};

	public usePlaying = (): boolean => {
		return this.playingDelegate.useState();
	};

	public useListener = (listener: TimeStateListener, precision?: number): void => {
		React.useEffect(() => {
			this.addListener(listener, precision);
			return () => this.removeListener(listener);
		}, [listener, precision]);
	};

	public addListener = (listener: TimeStateListener, precision?: number): void => {
		precision = parseFloat(((Math.round(precision) || 1) + "").split("").map((digit, i) => i === 0 ? "1" : "0").join(""));
		const handler: TimeStateHandler = { listener, precision, lastTime: -1 };
		const index = this.handlers.findIndex(handler => handler.listener === listener);
		if (index === -1) this.handlers.push(handler);
		else this.handlers[index] = {
			...handler,
			lastTime: this.handlers[index].lastTime,
		};
	};

	public removeListener = (listener: TimeStateListener): void => {
		const index = this.handlers.findIndex(handler => handler.listener === listener);
		if (index !== -1) this.handlers.splice(index, 1);
	};

	public start = (): void => {
		if (this.playingDelegate.value) return;
		this.playingDelegate.trigger(true);
		this.lastTime = performance.now();
		this.runFrame();
	};

	public stop = (): void => {
		this.playingDelegate.trigger(false);
		cancelAnimationFrame(this.frameRef);
	};

	public Provider = (props: {children: React.ReactNode}): React.ReactElement => {
		const { context: Context } = TimeState;
		return <Context.Provider value={this}>{props.children}</Context.Provider>;
	};

	private runFrame = (): void => {
		if (this.playingDelegate.value) this.frameRef = requestAnimationFrame(this.frame);
	};

	private frame: FrameRequestCallback = timeSinceRun => {
		const dt = timeSinceRun - this.lastTime;
		this.lastTime = timeSinceRun;
		this.trigger(this.accumulatedTime + dt);
		this.runFrame();
	};

	private trigger(time: number): void {
		const dt = time - this.accumulatedTime;
		this.accumulatedTime = time;

		this.handlers.forEach(handler => {
			const { listener, precision, lastTime } = handler;
			const flooredTime = Math.floor(time / precision);
			const flooredLastTime = Math.floor(lastTime / precision);

			if (flooredTime !== flooredLastTime) {
				listener([time, dt]);
				handler.lastTime = flooredTime * precision;
			}
		});
	}
}
