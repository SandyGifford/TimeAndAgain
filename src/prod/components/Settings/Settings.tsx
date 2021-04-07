import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";

export interface SettingsProps {
	className?: string;
}

const Settings: React.FunctionComponent<SettingsProps> = ({ className }) => {
	return <div className={BEMUtils.className("Settings", { merge: [className] })}>Settings</div>;
};

Settings.displayName = "Settings";

export default React.memo(Settings);

import "./Settings.style";
