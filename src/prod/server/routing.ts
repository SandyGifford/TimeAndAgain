import express from "express";
import path from "path";
import url from "url";

const app = express();

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, "dist");

app.get("/", (req, res) => res.sendFile(path.join(distDir, "index.html")));
app.get("*", (req, res) => res.sendFile(path.join(distDir, url.parse(req.url).pathname)));

export default app;
