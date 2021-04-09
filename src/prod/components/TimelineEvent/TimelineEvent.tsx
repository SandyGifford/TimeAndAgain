import * as React from "react";
import { FantasyEvent } from "../../typings/appData";
import BEMUtils from "../../utils/BEMUtils";
import ColorUtils from "../../utils/ColorUtils";

export interface TimelineEventProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children"> {
	event: FantasyEvent;
	zeroPX: number;
	msPerPixel: number;
}

const TimelineEvent: React.FunctionComponent<TimelineEventProps> = ({ className, event: { name, color, duration, startTime }, msPerPixel, zeroPX, style, ...divProps }) => {
	const hsl = ColorUtils.cssToRGB(color);
	hsl.a = 0.25;

	return <div
		{...divProps}
		style={{
			borderColor: color,
			backgroundColor: ColorUtils.getCSSColor(hsl),
			left: (startTime / msPerPixel) + zeroPX,
			width: (duration / msPerPixel),
			...style,
		}}
		className={BEMUtils.className("TimelineEvent", { merge: [className] })}>
		<div className="TimelineEvent__text">{name}</div>
	</div>;
};

TimelineEvent.displayName = "TimelineEvent";

export default React.memo(TimelineEvent);

import "./TimelineEvent.style";
