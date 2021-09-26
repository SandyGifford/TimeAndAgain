console.clear();

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

process.env.APP_PORT = process.env.APP_PORT || "3000";

import express from "express";
import routing from "./routing";
// import NodeWebSocket from "ws";

// const wss = new NodeWebSocket.Server({ port: 8081 });
const app = express();
app.use(routing);

export default app;
