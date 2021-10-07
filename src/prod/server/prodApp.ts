console.clear();

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

process.env.APP_PORT = process.env.APP_PORT || "3000";

import express from "express";
import routing from "./routing";
import API from "./API";

const app = express();
app.use(routing);
app.use(API);

export default app;
