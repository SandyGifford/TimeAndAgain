// based on https://gist.github.com/mjackson/5311256

import { HSLColor, ArrayColor, RGBColor } from "../typings/color";

export default class ColorUtils {
	public static cssToRGB(css: string): RGBColor {
		const div = document.createElement("div");
		div.style.color = css;

		document.body.append(div);
		const rgbStr = getComputedStyle(div).color;
		document.body.removeChild(div);

		const [r, g, b, a] = (
			rgbStr
				.replace(/\s/g, "")
				.match(/rgba?\((\d+(?:\.\d+)?),(\d+(?:\.\d+)?),(\d+(?:\.\d+)?)(?:,(\d+(?:\.\d+)?))?\)/i) || []
		)
			.slice(1)
			.map(val => parseFloat(val));

		return {
			r,
			g,
			b,
			a: isNaN(a) ? 1 : a,
		};
	}

	public static cssToHSL(css: string): HSLColor {
		return ColorUtils.rgbToHSL(ColorUtils.cssToRGB(css));
	}

	public static isRGB(color: HSLColor | RGBColor): color is RGBColor {
		return typeof (color as RGBColor).r === "number";
	}

	public static isHSL(color: HSLColor | RGBColor): color is HSLColor {
		return !ColorUtils.isRGB(color);
	}

	public static arrayToHSL(color: ArrayColor): HSLColor {
		return {
			h: color[0],
			s: color[1],
			l: color[2],
			a: color[3],
		};
	}

	public static arrayToRGB(color: ArrayColor): RGBColor {
		return {
			r: color[0],
			g: color[1],
			b: color[2],
			a: color[3],
		};
	}

	public static hslToArray(color: HSLColor): ArrayColor {
		return [
			color.h,
			color.s,
			color.l,
			color.a,
		];
	}

	public static rgbToArray(color: RGBColor): ArrayColor {
		return [
			color.r,
			color.g,
			color.b,
			color.a,
		];
	}

	public static getCSSColor(color: HSLColor | RGBColor): string {
		if (ColorUtils.isHSL(color)) {
			const { h, s, l, a } = color;
			return `hsla(${360 * h / 255}, ${100 * s / 255}%, ${100 * l / 255}%, ${a})`;
		} else {
			const { r, g, b, a } = color;
			return `rgba(${r}, ${g}, ${b}, ${a})`;
		}
	}

	public static rgbToHSL(color: ArrayColor): ArrayColor;
	public static rgbToHSL(color: RGBColor): HSLColor;
	public static rgbToHSL(color: ArrayColor | RGBColor): ArrayColor | HSLColor {
		let r: number, g: number, b: number, a: number;

		if (Array.isArray(color)) [r, g, b, a] = color;
		else {
			r = color.r;
			g = color.g;
			b = color.b;
			a = color.a;
		}

		r /= 255, g /= 255, b /= 255;

		const max = Math.max(r, g, b), min = Math.min(r, g, b);
		let h: number, s: number;
		const l = (max + min) / 2;

		if (max === min) {
			h = s = 0; // achromatic
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}

			h /= 6;
		}

		const arrayColor: ArrayColor = [h * 255, s * 255, l * 255, a];

		if (Array.isArray(color)) return arrayColor;
		else return ColorUtils.arrayToHSL(arrayColor);
	}

	public static hslToRGB(color: ArrayColor): ArrayColor;
	public static hslToRGB(color: HSLColor): RGBColor;
	public static hslToRGB(color: ArrayColor | HSLColor): ArrayColor | RGBColor {
		let h: number, s: number, l: number, a: number;

		if (Array.isArray(color)) [h, s, l, a] = color;
		else {
			h = color.h;
			s = color.s;
			l = color.l;
			a = color.a;
		}

		h /= 255;
		s /= 255;
		l /= 255;
		let r, g, b;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {

			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;

			r = ColorUtils.hue2RGBComponent(p, q, h + 1 / 3);
			g = ColorUtils.hue2RGBComponent(p, q, h);
			b = ColorUtils.hue2RGBComponent(p, q, h - 1 / 3);
		}

		const arrayColor: ArrayColor = [r * 255, g * 255, b * 255, a];

		if (Array.isArray(color)) return arrayColor;
		else return ColorUtils.arrayToRGB(arrayColor);
	}

	private static hue2RGBComponent(p: number, q: number, t: number): number {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
}
