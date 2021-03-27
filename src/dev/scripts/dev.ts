import { io } from "socket.io-client";

const socket = io("http://localhost:3000");
socket.on("devBuildSuccess", () => {
	window.location.reload(true);
});
// socket.on("devBuildFail", this.failure);
