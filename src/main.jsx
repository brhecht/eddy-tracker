import React from "react";
import ReactDOM from "react-dom/client";
import Auth from "./Auth";
import EddyTracker from "./EddyTracker";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Auth>
      <EddyTracker />
    </Auth>
  </React.StrictMode>
);
