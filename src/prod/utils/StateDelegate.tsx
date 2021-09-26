import React from "react";
import EventDelegate, { EventDelegateListener, MapEventDelegate, MapEventDelegateAllListener } from "./EventDelegate";

export class StateDelegate<T> extends EventDelegate<T> {
	public get value (): T {
		return this._value;
	}
	private _value: T = null;

	constructor(private initialValue: T) {
		super();
		this._value = initialValue;
	}

	public useWhileMounted = (listener: EventDelegateListener<T>, dependencies: React.DependencyList = [listener]): void => {
		React.useEffect(() => {
			this.listen(listener);
			return () => this.stopListen(listener);
		}, dependencies);
	};

	public reset = (): void => {
		this.trigger(this.initialValue);
	};

	public useState = (): T => {
		const [state, setState] = React.useState(this._value);
		this.useWhileMounted(setState);
		return state;
	};

	public trigger(value: T): void {
		this._value = value;
		super.trigger(value);
	}
}

export class MapStateDelegate<T, K extends string = string> extends MapEventDelegate<T, K> {
	private value = {} as Record<K, T>;

	constructor(initialValue = {} as Record<K, T>) {
		super();
		this.value = initialValue;
	}

	public get = (key: K): T => this.value[key];

	public useWhileMounted = (key: K, listener: EventDelegateListener<T>): void => {
		React.useEffect(() => {
			this.listen(key, listener);
			return () => this.stopListen(key, listener);
		}, [key, listener]);
	};

	public useAllWhileMounted = (listener: MapEventDelegateAllListener<T>): void => {
		React.useEffect(() => {
			this.listenAll(listener);
			return () => this.stopListenAll(listener);
		}, [listener]);
	};

	public useState = (key: K): T => {
		const [state, setState] = React.useState(this.value[key]);
		this.useWhileMounted(key, setState);
		return state;
	};

	public trigger(key: K, value: T): void {
		this.value[key] = value;
		super.trigger(key, value);
	}
}
