import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";
import { FantasyTimeStateYearSegment } from "../../utils/FantasyTimeState";

export interface YearSegmentEditorProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "children"> {
	segments: FantasyTimeStateYearSegment[];
	segmentsChanged(segments: FantasyTimeStateYearSegment[]): void;
}

const YearSegmentEditor: React.FunctionComponent<YearSegmentEditorProps> = ({ className, segments, segmentsChanged, ...divProps }) => {
	return <div
		{...divProps}
		className={BEMUtils.className("YearSegmentEditor", { merge: [className] })}>
		{
			segments.map(({ name, startDay }) => <div className="YearSegmentEditor__segment">{name}</div>)
		}
	</div>;
};

YearSegmentEditor.displayName = "YearSegmentEditor";

export default React.memo(YearSegmentEditor);

import "./YearSegmentEditor.style";
