import { FantasyTimeStateOptions } from "../utils/FantasyTimeState";

export interface ProdSocketMessageDataMap {
	ms: number;
	playing: boolean;
	options: FantasyTimeStateOptions;
	full: {
		ms: number;
		playing: boolean;
		options: FantasyTimeStateOptions;
	}
}
