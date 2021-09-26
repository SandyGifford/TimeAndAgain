import * as uuid from "uuid";

export default class DataUtils {
	public static generateId(): string {
		return uuid.v4();
	}

	public static randomInArray<T>(arr: T[]): T {
		return arr[Math.floor(Math.random() * arr.length)];
	}

	public static randomColor(): string {
		return DataUtils.randomInArray(["red", "orange", "yellow", "green", "blue", "indigo", "violet"]);
	}
}
