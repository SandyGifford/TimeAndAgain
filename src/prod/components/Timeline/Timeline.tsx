import * as React from "react";
import { TimelineContext } from "../../contexts";
import { FantasyEvent } from "../../typings/appData";
import BEMUtils from "../../utils/BEMUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import ReactUtils from "../../utils/ReactUtils";
import TimelineEvent from "../TimelineEvent/TimelineEvent";

export interface TimelineProps {
	className?: string;
	msPerPixel: number;
	style?: React.CSSProperties;
}

const Timeline: React.FunctionComponent<TimelineProps> = ({ className, msPerPixel, style }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [offsets, setOffsets] = React.useState<{width: number; left: number;}>({
		left: 0,
		width: window.innerWidth,
	});
	const deltaT = offsets.width * msPerPixel;
	const timelineCtx = React.useContext(TimelineContext);
	const [timeline] = timelineCtx.useState();
	const [time, dt] = timeState.useTime();
	const animTime = ReactUtils.useAnimateValue(time, Math.abs(dt) > 500 ? 100 : 0);

	const startMSOffset = deltaT * 0.25;
	const startMS = animTime - startMSOffset;
	const endMS = animTime + deltaT * 0.75;
	const timeOffsetPX = startMSOffset / msPerPixel;
	const zeroPX = (-animTime / msPerPixel) + timeOffsetPX;
	const eventStack: { event: FantasyEvent; id: string; }[][] = [];

	timeline.forEach(({ item: event, id }) => {
		let line = eventStack.find(line => {
			const lastEvent = line.slice(-1)[0];
			if (!lastEvent) return true;
			return lastEvent.event.startTime + lastEvent.event.duration < event.startTime;
		});
		if (!line) {
			line = [];
			eventStack.push(line);
		}

		line.push({ event, id });
	});

	const ref = ReactUtils.useResizeObserver<HTMLDivElement>(() => {
		const { left, width } = ref.current.getBoundingClientRect();
		if (offsets.width !== width || offsets.left !== left) setOffsets({ left, width });
	});

	return <div className={BEMUtils.className("Timeline", { merge: [className] })} ref={ref} style={style}>
		{
			eventStack.map((line, l) => line.map(({ event, id }) => {
				const { startTime, duration } = event;

				if (startTime > endMS || (startTime + duration) < startMS) return null;
				return <TimelineEvent
					className="Timeline__event"
					eventId={id}
					deleteById={timelineCtx.deleteById}
					timelineLeftOffset={offsets.left}
					timelineRightOffset={offsets.width + offsets.left}
					event={event}
					zeroPX={zeroPX}
					msPerPixel={msPerPixel}
					style={{
						top: `${l * 1.1}em`,
					}}
					key={id} />;
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
