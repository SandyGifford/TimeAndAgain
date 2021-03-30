import React from "react";
import { FantasyEvent } from "./typings/appData";
import { StateDelegate } from "./utils/EventDelegate";

export const TimelineContext = React.createContext<StateDelegate<FantasyEvent[]>>(null);
