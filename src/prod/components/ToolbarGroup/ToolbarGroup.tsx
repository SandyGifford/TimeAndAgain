import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";

export interface ToolbarGroupProps {
	className?: string;
	header?: string;
	children?: React.ReactNode;
}

const ToolbarGroup: React.FunctionComponent<ToolbarGroupProps> = ({ className, header, children }) => {
	return <div className={BEMUtils.className("ToolbarGroup", { merge: [className] })}>
		<div className="ToolbarGroup__header">{header}</div>
		<div className="ToolbarGroup__content">{children}</div>
	</div>;
};

ToolbarGroup.displayName = "ToolbarGroup";

export default React.memo(ToolbarGroup);

import "./ToolbarGroup.style";
