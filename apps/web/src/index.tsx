// For MUI
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import { App } from "./App";

// @ts-ignore until typings come out
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
