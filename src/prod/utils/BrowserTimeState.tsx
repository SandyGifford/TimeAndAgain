import * as React from "react";
import { StateDelegate } from "./StateDelegate";
import TimeState, { TimeStateInit, TimeStateListener, TimeStateTime } from "./TimeState";

export default class BrowserTimeState extends TimeState {
	protected static context = React.createContext<BrowserTimeState>(null);

	public static useNewTimeState(init?: TimeStateInit): BrowserTimeState {
		const firstFrame = React.useRef(true);
		const state = React.useRef(firstFrame.current ? new BrowserTimeState(init) : null);
		firstFrame.current = false;
		return state.current;
	}

	public static Provider(props: {children: React.ReactNode}): React.ReactElement {
		const state = BrowserTimeState.useNewTimeState();
		return state.Provider(props);
	}

	public static useTimeState(): BrowserTimeState {
		return React.useContext(BrowserTimeState.context);
	}

	public static useListener(listener: TimeStateListener, precision?: number): void {
		const state = BrowserTimeState.useTimeState();
		state.useListener(listener, precision);
	}

	public static useTime(precision?: number): TimeStateTime {
		const state = BrowserTimeState.useTimeState();
		return state.useTime(precision);
	}

	public static usePlaying(): boolean {
		const state = BrowserTimeState.useTimeState();
		return state.usePlaying();
	}

	protected playingDelegate = new StateDelegate(false);

	constructor(init?: TimeStateInit) {
		super(init);
	}

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

	public Provider = (props: {children: React.ReactNode}): React.ReactElement => {
		const { context: Context } = BrowserTimeState;
		return <Context.Provider value={this}>{props.children}</Context.Provider>;
	};
}
