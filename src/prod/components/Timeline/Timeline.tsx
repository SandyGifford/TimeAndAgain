import * as React from "react";
import { TimelineContext } from "../../contexts";
import { FantasyEvent } from "../../typings/appData";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";

export interface TimelineProps {
	className?: string;
	msPerPixel: number;
	style?: React.CSSProperties;
}

const Timeline: React.FunctionComponent<TimelineProps> = ({ className, msPerPixel, style }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [width, setWidth] = React.useState<number>(0);
	const deltaT = width * msPerPixel;
	const timeline = React.useContext(TimelineContext).useState();
	const time = timeState.useTime();

	const startMSOffset = deltaT * 0.25;
	const startMS = time - startMSOffset;
	const endMS = time + deltaT * 0.75;
	const timeOffsetPX = startMSOffset / msPerPixel;
	const zeroPX = (-time / msPerPixel) + timeOffsetPX;
	const eventStack: FantasyEvent[][] = [];

	timeline.forEach(event => {
		let line = eventStack.find(line => {
			const lastEvent = line.slice(-1)[0];
			if (!lastEvent) return true;
			return lastEvent.startTime + lastEvent.duration < event.startTime;
		});
		if (!line) {
			line = [];
			eventStack.push(line);
		}

		line.push(event);
	});

	const ref = ReactUtils.useResizeObserver<HTMLDivElement>(() => {
		setWidth(ref.current.offsetWidth);
	});

	return <div className={BEMUtils.className("Timeline", { merge: [className] })} ref={ref} style={style}>
		{
			eventStack.map((line, l) => line.map(({ color, name, startTime, duration, id }) => {
				if (startTime > endMS || (startTime + duration) < startMS) return null;
				return <div
					className="Timeline__event"
					style={{
						background: color,
						left: (startTime / msPerPixel) + zeroPX,
						width: (duration / msPerPixel),
						top: `${l * 1.1}em`,
					}}
					key={id}>
					<div className="Timeline__event__text">
						{name}
					</div>
				</div>;
			}))
		}
		<div
			className="Timeline__now"
			style={{
				left: timeOffsetPX,
			}} />
	</div>;
};

Timeline.displayName = "Timeline";

export default React.memo(Timeline);

import "./Timeline.style";
