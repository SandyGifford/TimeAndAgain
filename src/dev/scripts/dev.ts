import WSHelper from "../../prod/misc/WSHelper";
import { DevSocketMessageDataMap } from "../typings/devSocketTypings";

function socketConnect(): void {
	const ws = new WebSocket("ws://localhost:8080");
	const wsHelper = new WSHelper<DevSocketMessageDataMap>(ws);

	ws.addEventListener("open", () => {
		console.log("Socket connected");
	});

	wsHelper.addEventListener("buildFail", errors => {
		console.error("Fail", errors);
	});

	wsHelper.addEventListener("buildSuccess", () => {
		window.location.reload();
	});

	ws.addEventListener("close", e => {
		console.log("Dev socket is closed. Reconnect will be attempted in 1 second.", e.reason);
		setTimeout(function() {
			socketConnect();
		}, 1000);
	});

	ws.addEventListener("error", e => {
		console.error("Socket encountered error: ", (e as any).message, "Closing socket");
		ws.close();
	});
}

socketConnect();
