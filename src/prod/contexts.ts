import React from "react";
import { FantasyEvent } from "./typings/appData";
import { UIListDelegate } from "react-state-delegate";

export const TimelineContext = React.createContext<UIListDelegate<FantasyEvent>>(null);
