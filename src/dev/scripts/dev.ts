import { WSAssistantClient } from "ws-assistant-client";
import { DevSocketMessageDataMap } from "../typings/devSocketTypings";

const ws = new WSAssistantClient<DevSocketMessageDataMap>(`ws://${location.hostname}:8080`);

ws.addMessageListener("buildFail", errors => {
	console.error("Fail", errors);
});

ws.addMessageListener("buildSuccess", () => {
	console.log("eyyyyy");
	window.location.reload();
});

ws.open();
