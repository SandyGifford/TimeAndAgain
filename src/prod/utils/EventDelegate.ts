import React from "react";

export type EventDelegateListener<T> = (val: T) => void;
export type MapEventDelegateAllListener<T, K extends string = string> = (key: K, val: T) => void;

export default class EventDelegate<T> {
	protected listeners: EventDelegateListener<T>[] = [];

	constructor() {
		this.trigger = this.trigger.bind(this);
	}

	public listen = (listener: EventDelegateListener<T>): void => {
		const index = this.listeners.indexOf(listener);
		if (index === -1) this.listeners.push(listener);
	};

	public stopListen = (listener: EventDelegateListener<T>): void => {
		const index = this.listeners.indexOf(listener);
		if (index !== -1) this.listeners.splice(index, 1);
	};

	public trigger(value: T): void {
		this.listeners.forEach(l => l(value));
	}

	public useWhileMounted = (listener: EventDelegateListener<T>, dependencies: React.DependencyList = [listener]): void => {
		React.useEffect(() => {
			this.listen(listener);
			return () => this.stopListen(listener);
		}, dependencies);
	};
}

export class StateDelegate<T> extends EventDelegate<T> {
	public get value (): T {
		return this._value;
	}
	private _value: T = null;

	constructor(private initialValue: T) {
		super();
		this._value = initialValue;
	}

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

export class MapEventDelegate<T, K extends string = string> {
	// for some reason the generic here requires that we cast the object
	protected listeners = {} as Record<K, EventDelegateListener<T>[]>;
	protected allListeners: MapEventDelegateAllListener<T, K>[] = [];

	constructor() {
		this.trigger = this.trigger.bind(this);
	}

	public listen = (key: K, listener: EventDelegateListener<T>): void => {
		if (!this.listeners[key]) this.listeners[key] = [];
		const index = this.listeners[key].indexOf(listener);
		if (index === -1) this.listeners[key].push(listener);
	};

	public stopListen = (key: K, listener: EventDelegateListener<T>): void => {
		if (!this.listeners[key]) return;
		const index = this.listeners[key].indexOf(listener);
		if (index !== -1) this.listeners[key].splice(index, 1);
		if (!this.listeners[key].length) delete this.listeners[key];
	};

	public trigger(key: K, value: T): void {
		(this.listeners[key] || []).forEach(l => l(value));
		(this.allListeners || []).forEach(l => l(key, value));
	}

	public useWhileMounted = (key: K, listener: EventDelegateListener<T>): void => {
		React.useEffect(() => {
			this.listen(key, listener);
			return () => this.stopListen(key, listener);
		}, [key, listener]);
	};

	public listenAll = (listener: MapEventDelegateAllListener<T>): void => {
		const index = this.allListeners.indexOf(listener);
		if (index === -1) this.allListeners.push(listener);
	};

	public stopListenAll = (listener: MapEventDelegateAllListener<T>): void => {
		const index = this.allListeners.indexOf(listener);
		if (index !== -1) this.allListeners.splice(index, 1);
	};

	public useAllWhileMounted = (listener: MapEventDelegateAllListener<T>): void => {
		React.useEffect(() => {
			this.listenAll(listener);
			return () => this.stopListenAll(listener);
		}, [listener]);
	};
}

export class MapStateDelegate<T, K extends string = string> extends MapEventDelegate<T, K> {
	private value = {} as Record<K, T>;

	constructor(initialValue = {} as Record<K, T>) {
		super();
		this.value = initialValue;
	}

	public get = (key: K): T => this.value[key];

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
