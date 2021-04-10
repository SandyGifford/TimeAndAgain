import * as React from "react";
import { FantasyEvent } from "../../typings/appData";
import BEMUtils from "../../utils/BEMUtils";
import ColorUtils from "../../utils/ColorUtils";
import ReactUtils from "../../utils/ReactUtils";

export interface TimelineEventProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children"> {
	event: FantasyEvent;
	zeroPX: number;
	msPerPixel: number;
	timelineLeftOffset: number;
	timelineRightOffset: number;
}

const TimelineEvent: React.FunctionComponent<TimelineEventProps> = ({
	className,
	event: { name, color, duration, startTime },
	msPerPixel,
	zeroPX,
	style,
	timelineLeftOffset,
	timelineRightOffset,
	...divProps
}) => {
	const bgColor = ReactUtils.useTransformedValue(color, color => {
		const hsl = ColorUtils.cssToRGB(color);
		hsl.a = 0.25;
		return ColorUtils.getCSSColor(hsl);
	});
	const contentRef = React.useRef<HTMLDivElement>();
	const [textEdges, setTextEdges] = React.useState({ left: 0, right: 0 });

	React.useEffect(() => {
		let left = 0;
		let right = 0;
		const rect = contentRef.current.getBoundingClientRect();
		if (rect.left < timelineLeftOffset) left = -rect.left;
		if (rect.right > timelineRightOffset) right = rect.right - timelineRightOffset;

		setTextEdges({ left, right });
	}, [zeroPX, startTime, msPerPixel, timelineLeftOffset, timelineRightOffset]);

	return <div
		{...divProps}
		style={{
			borderColor: color,
			backgroundColor: bgColor,
			left: (startTime / msPerPixel) + zeroPX,
			width: (duration / msPerPixel),
			...style,
		}}
		className={BEMUtils.className("TimelineEvent", { merge: [className] })}>
		<div className="TimelineEvent__content" ref={contentRef}>
			<div
				className="TimelineEvent__content__text"
				style={{
					...textEdges,
				}}>
				{name}
			</div>
		</div>
	</div>;
};

TimelineEvent.displayName = "TimelineEvent";

export default React.memo(TimelineEvent);

import "./TimelineEvent.style";
