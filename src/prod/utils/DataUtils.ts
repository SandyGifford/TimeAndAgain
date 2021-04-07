import * as uuid from "uuid";
import { FantasyEvent } from "../typings/appData";

export default class DataUtils {
	public static generateId(): string {
		return uuid.v4();
	}

	public static makeFantasyEvent(event: Omit<FantasyEvent, "id">): FantasyEvent {
		return {
			...event,
			id: DataUtils.generateId(),
		};
	}
}
