import * as React from "react";
import { TimelineContext } from "../../contexts";
import BEMUtils from "../../utils/BEMUtils";
import DataUtils from "../../utils/DataUtils";
import FantasyTimeState from "../../utils/FantasyTimeState";
import RelDatePicker from "../RelDatePicker/RelDatePicker";

export interface QuickEventProps {
	className?: string;
}

const QuickEvent: React.FunctionComponent<QuickEventProps> = ({ className }) => {
	const timeState = FantasyTimeState.useFantasyTimeState();
	const [duration, setDuration] = React.useState(timeState.minuteToMS(1));
	const [eventName, setEventName] = React.useState("");
	const timelineCtx = React.useContext(TimelineContext);

	function newEvent(): void {
		timelineCtx.push({
			color: DataUtils.randomColor(),
			duration: duration,
			name: eventName,
			startTime: timeState.time,
		});
		setEventName("");
	}

	return <div className={BEMUtils.className("QuickEvent", { merge: [className] })}>
		<RelDatePicker
			value={duration}
			onChange={setDuration} />
		<input
			onKeyDown={e => {
				switch (e.key) {
					case "Enter":
						newEvent();
						break;
				}
			}}
			value={eventName}
			placeholder="event name..."
			onChange={e => setEventName(e.target.value)} />
		<button
			disabled={!eventName}
			onClick={newEvent}>
					Make event
		</button>
	</div>;
};

QuickEvent.displayName = "QuickEvent";

export default React.memo(QuickEvent);

import "./QuickEvent.style";
