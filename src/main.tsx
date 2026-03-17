import * as Sentry from '@sentry/react';
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    // Captura 10% das sessões em produção para performance monitoring
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 0,
    // Não enviar erros em desenvolvimento
    enabled: import.meta.env.PROD,
  });
}

createRoot(document.getElementById("root")!).render(<App />);
  