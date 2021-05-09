import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";

export interface ToolbarProps {
	className?: string;
	children?: React.ReactNode;
}

const Toolbar: React.FunctionComponent<ToolbarProps> = ({ className, children }) => {
	return <div className={BEMUtils.className("Toolbar", { merge: [className] })}>{
		children
	}</div>;
};

Toolbar.displayName = "Toolbar";

export default React.memo(Toolbar);

import "./Toolbar.style";
