import * as React from "react";
import BEMUtils from "../../utils/BEMUtils";

export interface IconProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>, "children"> {
	icon: string;
}

const Icon: React.FunctionComponent<IconProps> = ({ className, icon, ...iProps }) => {
	return <i
		{...iProps}
		className={BEMUtils.className("Icon", { merge: [className, "fa", `fa-${icon}`] })} />;
};

Icon.displayName = "Icon";

export default React.memo(Icon);

import "./Icon.style";
