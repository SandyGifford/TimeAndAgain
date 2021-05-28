import React from "react";
import EventDelegate from "./EventDelegate";
import ReactUtils from "./ReactUtils";

export class UIListDelegateException extends Error {}
export class UIListDelegateDuplicateIdException extends UIListDelegateException {}
export type UIListDelegateIDInjector<T> = T | ((id: string) => T);

export interface UIListDelegateOptions<T> {
	initial?: T[];
	animOutMS?: number;
	animInMS?: number;
	notifyNotNew?: boolean;
}

export interface UIListDelegateItem<T> {
	id: string;
	item: T;
	animOut?: boolean;
	animIn?: boolean;
	isNew?: boolean;
	removeDelegate: EventDelegate<void>;
}

type UIListDelegateSetter<T> = (state: UIListDelegateItem<T>[]) => void;

interface UIListDelegateSetterData<T> {
	setter: UIListDelegateSetter<T>;
	id: string;
}

export default class UIListDelegate<T> {
	private lastId = 0;
	private lastSetterId = 0;
	private options?: UIListDelegateOptions<T>;
	private liveCount = 0;

	private items: UIListDelegateItem<T>[] = [];

	private setters: UIListDelegateSetterData<T>[] = [];
	private animTimers: Record<string, number> = {};

	constructor(options?: UIListDelegateOptions<T>) {
		this.options = {
			initial: [],
			...options,
		};

		this.options.initial.forEach(i => this.push(i));
	}

	public push = (item: UIListDelegateIDInjector<T>, id?: string): string => {
		const existingIndex = id ? this.findItemIndex(id) : -1;
		const wrappedItem = this.createItem(item, id);

		if (existingIndex === -1) this.items.push(wrappedItem);
		else this.items[existingIndex] = wrappedItem;

		this.trigger();
		return wrappedItem.id;
	};

	public clear = (cleanUp: (item: UIListDelegateItem<T>) => void = () => null): void => {
		this.reverseForEach((item, i) => {
			cleanUp(this.deleteAtIndex(i));
		});
	};

	public pop = (): UIListDelegateItem<T> => {
		if (this.items.length) return this.deleteAtIndex(this.items.length - 1);
		return undefined;
	};

	public unshift = (item: UIListDelegateIDInjector<T>, id?: string): string => {
		const existingIndex = id ? this.findItemIndex(id) : -1;
		const wrappedItem = this.createItem(item, id);

		if (existingIndex === -1) this.items.unshift(wrappedItem);
		else this.items[existingIndex] = wrappedItem;

		this.trigger();
		return wrappedItem.id;
	};

	public addAfterId = (item: UIListDelegateIDInjector<T>, id: string): string => {
		return this.addAtIndex(item, this.findItemIndex(id) + 1);
	};

	public addBeforeId = (item: UIListDelegateIDInjector<T>, id: string): string => {
		return this.addAtIndex(item, this.findItemIndex(id));
	};

	public addAtIndex = (item: UIListDelegateIDInjector<T>, index: number, id?: string): string => {
		const existingIndex = id ? this.findItemIndex(id) : -1;
		const wrappedItem = this.createItem(item, id);

		if (existingIndex === -1) this.items.splice(index, 0, wrappedItem);
		else this.items[existingIndex] = wrappedItem;

		this.trigger();
		return wrappedItem.id;
	};

	public deleteAfterId = (id: string): void => {
		this.deleteAfterIndex(this.items.findIndex(i => i.id === id));
	};

	public deleteAfterIndex = (index: number): void => {
		this.reverseEvery((item, i) => {
			if (index === i) return false;
			this.deleteAtIndex(i);
			return true;
		});
	};

	public deleteById = (id: string): UIListDelegateItem<T> => {
		const index = this.findItemIndex(id);
		const ret = this.deleteAtIndex(index);
		this.trigger();
		return ret;
	};

	public deleteAtIndex = (index: number): UIListDelegateItem<T> => {
		console.log("deleting", index);
		if (index === -1) return null;
		const { id, removeDelegate } = this.items[index];
		const { animOutMS } = this.options;
		removeDelegate.trigger();

		if (animOutMS) {
			this.items[index].animOut = true;
			this.trigger();

			this.setAnimTimer(id, animOutMS, () => {
				const currentIndex = this.findItemIndex(id);
				this.items.splice(currentIndex, 1);
				this.trigger();
			});
		} else {
			this.items.splice(index, 1);
			this.trigger();
		}

		return { ...this.items[index] };
	};

	public useState = (): [UIListDelegateItem<T>[], number] => {
		const mountedRef = ReactUtils.useMounted();
		const [items, setItems] = React.useState<UIListDelegateItem<T>[]>(this.items);

		React.useEffect(() => {
			const id = "" + this.lastSetterId++;
			const setterData: UIListDelegateSetterData<T> = {
				id,
				setter: items => { if (mountedRef.current) setItems(items); },
			};

			this.setters.push(setterData);

			return () => {
				const index = this.setters.findIndex(setter => setter.id === id);
				if (index === -1) return;
				this.setters.splice(index, 1);
			};
		}, []);

		return [items, this.liveCount];
	};

	public addRemoveListenerByIndex(index: number, callback: () => void): void {
		this.items[index].removeDelegate.listen(callback);
	}

	public addRemoveListenerById(id: string, callback: () => void): void {
		const index = this.findItemIndex(id);
		this.addRemoveListenerByIndex(index, callback);
	}

	public removeRemoveListenerByIndex(index: number, callback: () => void): void {
		this.items[index].removeDelegate.stopListen(callback);
	}

	public removeRemoveListenerById(id: string, callback: () => void): void {
		const index = this.findItemIndex(id);
		this.addRemoveListenerByIndex(index, callback);
	}

	public forEach(callback: (item: T, id: string, index: number) => void): void {
		this.items.forEach(({ item, id }, i) => callback(item, id, i));
	}

	private setAnimTimer(id: string, duration: number, callback: () => void): void {
		clearTimeout(this.animTimers[id]);
		this.animTimers[id] = setTimeout(() => {
			callback();
			delete this.animTimers[id];
		}, duration) as any; // node typings... ugh...
	}

	private findItemIndex(id: string): number {
		return this.items.findIndex(i => i.id === id);
	}

	private trigger(): void {
		this.liveCount = this.items.reduce((count, inst) => inst.animOut ? count : count + 1, 0);

		this.setters.forEach(({ setter }) => {
			// calling a setter can result in removing other setters
			if (setter) setter([...this.items]);
		});
	}

	private createItem(item: UIListDelegateIDInjector<T>, id = "" + this.lastId++): UIListDelegateItem<T> {
		item = typeof item === "function" ? (item as ((id: string) => T))(id) : item;
		const wrappedItem: UIListDelegateItem<T> = {
			id,
			item,
			removeDelegate: new EventDelegate(),
		};

		if (this.options.notifyNotNew) {
			wrappedItem.isNew = true;
			requestAnimationFrame(() => {
				setTimeout(() => {
					const { animInMS } = this.options;
					const item = this.items[this.findItemIndex(id)];
					if (!item) return;
					if (animInMS) item.animIn = true;
					item.isNew = false;
					this.trigger();

					this.setAnimTimer(id, animInMS, () => {
						const item = this.items[this.findItemIndex(id)];
						if (!item) return;
						item.animIn = false;
						this.trigger();
					});
				}, 10);
			});
		}

		return wrappedItem;
	}

	private reverseEvery(callback: (item: UIListDelegateItem<T>, index: number) => boolean): boolean {
		for (let i = this.items.length - 1; i >= 0; i--) {
			if (!callback(this.items[i], i)) return false;
		}

		return true;
	}

	private reverseForEach(callback: (item: UIListDelegateItem<T>, index: number) => void): void {
		this.reverseEvery((item, index) => {
			callback(item, index);
			return true;
		});
	}
}
