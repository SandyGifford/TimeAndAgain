import { WSHelperClient } from "../../prod/misc/WSHelper";
import { DevSocketMessageDataMap } from "../typings/devSocketTypings";

const ws = new WSHelperClient<DevSocketMessageDataMap>(`ws://${location.hostname}:8080`);

ws.addMessageListener("buildFail", errors => {
	console.error("Fail", errors);
});

ws.addMessageListener("buildSuccess", () => {
	window.location.reload();
});
