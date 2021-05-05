import React from "react";

export default class ReactUtils {
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

	public static useTransformedValue<T, R>(val: T, transformer: (val: T) => R, deps?: React.DependencyList): R {
		const firstFrame = ReactUtils.useIsFirstFrame();

		let initial: R;
		if (firstFrame) initial = transformer(val);

		const [sVal, setSVal] = React.useState<R>(initial);

		React.useEffect(() => {
			setSVal(transformer(val));
		}, deps || [val]);

		return sVal;
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
