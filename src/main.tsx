import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster position="top-center" />
      <App />
    </Provider>
  </StrictMode>
);
