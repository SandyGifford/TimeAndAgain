export interface WSLike {
	send(data: string): void;
	addEventListener(type: "message", listener: (e: {data: string}) => void);
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


export default class WSHelper<M> {
	constructor(private ws: WSLike) {}

	public send<T extends keyof SelectSubType<M, void>>(type: T): void;
	public send<T extends keyof ExcludeSubType<M, void>>(type: T, data: M[T]): void;
	public send<T extends keyof M>(type: T, data?: M[T]): void {
		this.ws.send(JSON.stringify({ type, data }));
	}

	public addEventListener<T extends keyof SelectSubType<M, void>>(type: T, listener: () => void): void;
	public addEventListener<T extends keyof ExcludeSubType<M, void>>(type: T, listener: (data: M[T]) => void): void;
	public addEventListener<T extends keyof M>(type: T, listener: (data: M[T]) => void): void {
		this.ws.addEventListener("message", e => {
			const message = JSON.parse(e.data) as {type: string, data: any};
			if (type === message.type) listener(message.data);
		});
	}
}
