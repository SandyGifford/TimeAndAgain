import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App/App";

const target = document.createElement("div");
document.body.append(target);

ReactDOM.render(<App />, target);
