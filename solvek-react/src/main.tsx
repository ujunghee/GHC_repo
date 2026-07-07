import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { loadDesignSystemCss } from "./loadDesignSystemCss";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element #root was not found.");
}

loadDesignSystemCss();

createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
