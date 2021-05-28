import React from "react";
import { FantasyEvent } from "./typings/appData";
import UIListDelegate from "./utils/UIListDelegate";

export const TimelineContext = React.createContext<UIListDelegate<FantasyEvent>>(null);
