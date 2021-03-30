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
}
