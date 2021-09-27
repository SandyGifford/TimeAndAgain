import EventDelegate from "./EventDelegate";

export type TimeStateTime = [number, number];
export type TimeStateListener = (time: TimeStateTime) => void;

interface TimeStateHandler {
	precision?: number;
	lastTime: number;
	listener: TimeStateListener;
}

export interface TimeStateOptions {
	updateMS?: number;
}

export interface TimeStateInit extends TimeStateOptions {
	startTime?: number;
	playOnInit?: boolean;
	handlers?: (TimeStateListener | { handler: TimeStateListener; precision: number; })[];
}

export default class TimeState {
	public static makeTimer(func: () => void, ms?: number): () => void {
		const id = setInterval(func, ms);
		return () => clearTimeout(id);
	}

	private static getRealTime(): number {
		return (new Date()).getTime();
	}

	protected static separateInit<T extends TimeStateInit>(init: T): {
		init: Omit<TimeStateInit, keyof TimeStateOptions>;
		rest: Omit<T, keyof Omit<TimeStateInit, keyof TimeStateOptions>>
	} {
		const { handlers, playOnInit, startTime, ...rest } = init;
		return {
			init: { handlers, playOnInit, startTime },
			rest,
		}
	}

	public get playing() : boolean {
		return this._playing;
	}

	public get time() : number {
		return this.accumulatedTime;
	}

	protected handlers: TimeStateHandler[] = [];
	protected timerStoper: () => void;
	protected _playing = false;
	protected playingDelegate = new EventDelegate();
	protected accumulatedTime = 0;
	protected lastTime = 0;
	protected options: TimeStateOptions = {};

	constructor(init: TimeStateInit = {}) {
		const {
			init: { startTime, playOnInit, handlers },
			rest: options
		} = TimeState.separateInit(init);

		this.options = {
			updateMS: 500,
			...options,
		};

		(handlers || []).forEach(obj => {
			if (typeof obj === "function") this.addListener(obj);
			else this.addListener(obj.handler, obj.precision)
		});
		this.accumulatedTime = startTime;
		if (playOnInit) this.start();
	}

	public addTime = (ms: number): void => {
		this.setTime(this.accumulatedTime + ms);
	};

	public setTime = (ms: number): void => {
		this.trigger(ms);
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
		if (this._playing) return;
		if (this.timerStoper) this.timerStoper(); // this should never trigger
		this._playing = true;
		this.playingDelegate.trigger(true);
		this.lastTime = TimeState.getRealTime();
		this.timerStoper = TimeState.makeTimer(this.frame, 500);
	};

	public stop = (): void => {
		// record one last time
		this.frame();
		this._playing = false;
		if (this.timerStoper) this.timerStoper();
		this.playingDelegate.trigger(false);
	};

	private frame = (): void => {
		const time = TimeState.getRealTime();
		const dt = time - this.lastTime;
		this.lastTime = time;
		this.trigger(dt);
	};

	private trigger(dt: number): void {
		this.accumulatedTime += dt;

		this.handlers.forEach(handler => {
			const { listener, precision, lastTime } = handler;
			const flooredTime = Math.floor(this.accumulatedTime / precision);
			const flooredLastTime = Math.floor(lastTime / precision);

			if (flooredTime !== flooredLastTime) {
				listener([this.accumulatedTime, dt]);
				handler.lastTime = flooredTime * precision;
			}
		});
	}
}
