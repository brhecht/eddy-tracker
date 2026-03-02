import React from "react";
import ReactDOM from "react-dom/client";
import Auth from "./Auth";
import EddyTracker from "./EddyTracker";
import AppSwitcher from "./AppSwitcher";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppSwitcher current="eddy" />
    <Auth>
      <EddyTracker />
    </Auth>
  </React.StrictMode>
);
