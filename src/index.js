import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ReactGA from "react-ga";

// Initialize Google Analytics
ReactGA.initialize("G-3CGD1VB8CG"); // Your Measurement ID

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
