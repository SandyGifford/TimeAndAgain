import * as React from "react";
import { TimelineContext } from "../../contexts";
import { FantasyEvent } from "../../typings/appData";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";

export interface TimelineProps {
	className?: string;
}

const Timeline: React.FunctionComponent<TimelineProps> = ({ className }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [width, setWidth] = React.useState<number>(0);
	const [msPerPixel] = React.useState(timeState.minuteToMS(1) / 100);
	const deltaT = width * msPerPixel;
	const timeline = React.useContext(TimelineContext).useState();
	const time = timeState.useTime();

	// const startMS = time - deltaT * 0.25;
	// const endMS = time + deltaT * 0.75;
	const timeOffsetPX = deltaT * 0.25 / msPerPixel;
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

	return <div className={BEMUtils.className("Timeline", { merge: [className] })} ref={ref}>
		{
			eventStack.map((line, l) => <div className="Timeline__line" key={l}>{
				line.map(({ color, name, startTime, duration }, e) => {
					return <div
						className="Timeline__line__event"
						style={{
							background: color,
							left: (startTime / msPerPixel) + zeroPX,
							width: (duration / msPerPixel),
						}}
						key={e}>
						<div className="Timeline__line__event__text">
							{name}
						</div>
					</div>;
				})
			}</div>)
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
