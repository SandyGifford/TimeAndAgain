export interface WSLike {
	send(data: string): void;
	addEventListener(type: string, listener: (e: {data: string}) => void);
	removeEventListener(type: string, listener: (e: {data: string}) => void);
}

type SelectProps<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? Key : never
};

type SelectNames<Base, Condition> = SelectProps<Base, Condition>[keyof Base];

type SelectSubType<Base, Condition> = Pick<Base, SelectNames<Base, Condition>>;

type ExcludeProps<Base, Condition> = {
	[Key in keyof Base]: Base[Key] extends Condition ? never : Key
};

type ExcludeNames<Base, Condition> = ExcludeProps<Base, Condition>[keyof Base];

type ExcludeSubType<Base, Condition> = Pick<Base, ExcludeNames<Base, Condition>>;

export type WSClientEventType = "open" | "close" | "error";

export abstract class WSHelper<M> {
	constructor(protected ws: WSLike) {
		this.send = this.send.bind(this);
		this.addMessageListener = this.addMessageListener.bind(this);
		this.removeMessageListener = this.removeMessageListener.bind(this);
		this.addEventListener = this.addEventListener.bind(this);
		this.removeEventListener = this.removeEventListener.bind(this);
	}

	public send<T extends keyof SelectSubType<M, void>>(type: T): void;
	public send<T extends keyof ExcludeSubType<M, void>>(type: T, data: M[T]): void;
	public send<T extends keyof M>(type: T, data?: M[T]): void {
		this.ws.send(JSON.stringify({ type, data }));
	}

	public addMessageListener<T extends keyof SelectSubType<M, void>>(type: T, listener: () => void): void;
	public addMessageListener<T extends keyof ExcludeSubType<M, void>>(type: T, listener: (data: M[T]) => void): void;
	public addMessageListener<T extends keyof M>(type: T, listener: (data: M[T]) => void): void {
		this.addEventListener("message", e => {
			const message = JSON.parse(e.data) as {type: string, data: any};
			if (type === message.type) listener(message.data);
		});
	}

	public removeMessageListener<T extends keyof SelectSubType<M, void>>(type: T, listener: () => void): void;
	public removeMessageListener<T extends keyof ExcludeSubType<M, void>>(type: T, listener: (data: M[T]) => void): void;
	public removeMessageListener<T extends keyof M>(type: T, listener: (data: M[T]) => void): void {
		this.removeEventListener("message", e => {
			const message = JSON.parse(e.data) as {type: string, data: any};
			if (type === message.type) listener(message.data);
		});
	}

	public addEventListener(type: string, callback: (e: any) => void): void {
		this.ws.addEventListener(type, callback);
	}

	public removeEventListener(type: string, callback: (e: any) => void): void {
		this.ws.removeEventListener(type, callback);
	}
}

export class WSHelperClient<M> extends WSHelper<M> {
	protected ws: WebSocket;
	private listeners: Record<string, ((e: any) => void)[]> = {};

	constructor(private url: string, private retryMS = 1000) {
		super(new WebSocket(url));
	}

	public open = (): void => {
		if (this.ws) return;
		this.ws = new WebSocket(this.url);
		Object.keys(this.listeners).forEach(lType => {
			this.listeners[lType].forEach(listener => this.ws.addEventListener(lType, listener));
		});

		this.ws.addEventListener("open", () => {
			console.log(`Socket to ${this.url} connected`);
		});

		this.ws.addEventListener("close", e => {
			console.log(`Socket to ${this.url} is closed. Reconnect will be attempted in ${this.retryMS / 1000} second(s).`, e.reason);
			setTimeout(() => {
				this.open();
			}, this.retryMS);
		});
	
		this.ws.addEventListener("error", e => {
			console.error(`Socket to ${this.url} encountered error: `, (e as any).message, "Closing socket");
			this.close();
		});
	}

	public close = (): void => {
		if (!this.ws) return;
		this.ws.close();
		this.ws = null;
	};

	public addEventListener<T extends WSClientEventType>(type: T, callback: (e: WebSocketEventMap[T]) => void): void {
		if (!this.listeners[type]) this.listeners[type] = [];
		const listeners = this.listeners[type];
		if (listeners.indexOf(callback) === -1) listeners.push(callback);;
		super.addEventListener(type, callback);
	};

	public removeEventListener<T extends WSClientEventType>(type: T, callback: (e: WebSocketEventMap[T]) => void): void {
		if (!this.listeners[type]) this.listeners[type] = [];
		const listeners = this.listeners[type];
		const index = listeners.indexOf(callback)
		if (index !== -1) listeners.splice(index, 1);
		super.removeEventListener(type, callback);
	};
}
