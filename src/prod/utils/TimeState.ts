import EventDelegate from "./EventDelegate";

export type TimeStateTime = [number, number];
export type TimeStateListener = (time: TimeStateTime) => void;

interface TimeStateHandler {
	precision?: number;
	lastTime: number;
	listener: TimeStateListener;
}

export default class TimeState {
	public get playing() : boolean {
		return this._playing;
	}

	public get time() : number {
		return this.accumulatedTime;
	}

	protected handlers: TimeStateHandler[] = [];
	protected frameRef: number;
	protected _playing = false;
	protected playingDelegate = new EventDelegate();
	protected accumulatedTime = 0;
	protected lastTime = 0;

	constructor(
		protected animFunc: typeof requestAnimationFrame,
		protected cancelAnimFunc: typeof cancelAnimationFrame,
		startTime?: number
	) {
		this.accumulatedTime = startTime;
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
		this._playing = true;
		this.playingDelegate.trigger(true);
		this.lastTime = performance.now();
		this.runFrame();
	};

	public stop = (): void => {
		// record one last time
		this.cancelAnimFunc(this.frameRef);
		this.runFrame();
		this._playing = false;
		this.playingDelegate.trigger(false);
		this.cancelAnimFunc(this.frameRef);
	};

	private runFrame = (): void => {
		if (this._playing) this.frameRef = this.animFunc(this.frame);
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
