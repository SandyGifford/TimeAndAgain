import React from "react";
import { WSAssistantClient } from "ws-assistant-client";

let lastIdNum = 1;
export default class ReactUtils {
	public static useWS<M>(url: string, retryMS?: number): WSAssistantClient<M> {
		const ws = ReactUtils.useMakeOnce(() => new WSAssistantClient<M>(url, retryMS));

		React.useEffect(() => {
			return () => { ws.close(); };
		});

		return ws;
	}

	public static useResizeObserver<T extends HTMLElement>(update: () => void, ref: React.MutableRefObject<T> = React.useRef()): React.MutableRefObject<T> {
		let resizeObserver: ResizeObserver;

		React.useEffect(() => {
			if (ResizeObserver) {
				resizeObserver = new ResizeObserver(update);
				if (ref.current) resizeObserver.observe(ref.current);
			} else window.addEventListener("resize", update);

			return () => {
				if (resizeObserver) resizeObserver.disconnect();
				window.removeEventListener("resize", update);
			};
		}, [ref.current, update]);

		return ref;
	}

	public static useIsFirstFrame(): boolean {
		const firstFrame = React.useRef(true);
		const val = firstFrame.current;
		firstFrame.current = false;
		return val;
	}

	public static useUniqueNum(): number {
		const idNum = React.useRef<number>();
		if (!idNum.current) idNum.current = lastIdNum++;
		return idNum.current;
	}

	public static useUniqueId(compName: string): string {
		const idNum = ReactUtils.useUniqueNum();
		return `${compName}__${idNum}`;
	}

	public static useMounted(): React.RefObject<boolean> {
		const mounted = React.useRef(false);

		React.useEffect(() => {
			mounted.current = true;
			return () => { mounted.current = false; };
		}, []);

		return mounted;
	}

	public static useMakeValue<R>(maker: () => R, deps: React.DependencyList): R {
		const prevDeps = React.useRef<React.DependencyList>(undefined);
		const val = React.useRef<R>();
		if (!prevDeps.current || !deps.every((dep, i) => prevDeps[i] !== dep)) val.current = maker();
		return val.current;
	}

	public static useMakeState<R>(maker: () => R, deps: React.DependencyList): [R, (val: R) => void] {
		const firstFrame = ReactUtils.useIsFirstFrame();

		let initial: R;
		if (firstFrame) initial = maker();

		const [sVal, setSVal] = React.useState<R>(initial);

		React.useEffect(() => {
			setSVal(maker());
		}, deps);

		return [sVal, setSVal];
	}

	public static useTransformedValue<T, R>(val: T, transformer: (val: T) => R, deps?: React.DependencyList): R {
		return ReactUtils.useMakeValue(() => transformer(val), deps || [val]);
	}

	public static useMakeOnce<T>(maker: () => T): T {
		const ref = React.useRef<T>();
		const madeRef = React.useRef(false);
		if (!madeRef.current) {
			madeRef.current = true;
			ref.current = maker();
		}
		return ref.current;
	}

	public static useDampenNumber(value: number, maxNumPerS: number): number {
		const lastValueRef = React.useRef(value);
		const diff = value - lastValueRef.current;
		lastValueRef.current = value;
		const ms = diff / (maxNumPerS / 1000);
		return this.useAnimateValue(value, ms);
	}

	public static useAnimateValue(value: number, time = 1000): number {
		const [dispVal, setDispVal] = React.useState(value);
		const dispValRef = React.useRef(dispVal);
		dispValRef.current = dispVal;

		React.useEffect(() => {
			let animRef: number;
			const startTime = performance.now();
			const startVal = dispVal;
			const dVal = value - startVal;
			function frame(t: number): void {
				const dispVal = dispValRef.current;
				if (value !== dispVal) {
					const dt = t - startTime;
					const pct = dt / time;
					let newVal = startVal + pct * dVal;
					if (dt >= time) newVal = value;

					setDispVal(newVal);

					animRef = requestAnimationFrame(frame);
				}
			}
			frame(performance.now());
			return () => cancelAnimationFrame(animRef);
		}, [value, time]);

		return dispVal;
	}
}
