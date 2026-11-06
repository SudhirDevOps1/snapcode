import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/studio.css";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import { localFontCSS } from "./lib/fonts";

const fonts = document.createElement("style");
fonts.dataset.snapcodeFonts = "true";
fonts.textContent = localFontCSS;
document.head.appendChild(fonts);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Register the service worker (production only) so SnapCode is installable and
// works offline. Skipped in dev so stale caches never interfere with HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* The app remains usable if a browser blocks offline storage. */
    });
  });
}
