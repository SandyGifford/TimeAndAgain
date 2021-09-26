export interface BEMClassNameOptions {
	always?: string[];
	merge?: string[];
	mods?: {[name: string]: boolean};
}

export default class BEMUtils {
	public static className(baseName: string, opts: BEMClassNameOptions = {}): string {
		let out = baseName;
		const { always = [], merge = [], mods = {} } = opts;
		Object.keys(mods).forEach(cn => { if (mods[cn]) out += ` ${baseName}--${cn}`; });
		always.forEach(mod => { if (mod) out += ` ${baseName}--${mod}`; });
		merge.forEach(cn => { if (cn) out += ` ${cn}`; });
		return out;
	}
}
