import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ValuationProvider } from "./context/ValuationContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ValuationProvider>
        <App />
      </ValuationProvider>
    </BrowserRouter>
  </StrictMode>,
);
