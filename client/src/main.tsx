import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const storedDark = localStorage.getItem("socialgo_dark_mode");
if (storedDark === "true") {
  document.documentElement.classList.add("dark");
} else if (storedDark === "false") {
  document.documentElement.classList.remove("dark");
}

createRoot(document.getElementById("root")!).render(<App />);
