
export default class LoopUtils {
	public static forNTimes(n: number, callback: (i: number) => void): void {
		for (let i = 0; i < n; i++) callback(i);
	}

	public static mapNTimes<T>(n: number, callback: (i: number) => T): T[] {
		const arr: T[] = [];
		LoopUtils.forNTimes(n, i => arr.push(callback(i)));
		return arr;
	}

	public static doWhile(callback: (i: number) => boolean): boolean {
		let pass = true;
		for (let i = 0; pass; i++) pass = callback(i);
		return pass;
	}

	public static mapWhile<T>(callback: (i: number, stop: () => void) => T): T[] {
		const arr: T[] = [];
		let pass = true;
		for (let i = 0; pass; i++) callback(i, () => pass = false);
		return arr;
	}
}
