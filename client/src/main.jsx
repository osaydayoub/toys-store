import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { CacheProvider } from "@emotion/react";
import { useTranslation } from "react-i18next";

import App from "./App.jsx";
import { getTheme } from "./theme.js";
import { createEmotionCache } from "./createEmotionCache.js";
import "./i18n/i18n.js";

function Root() {
  const { i18n } = useTranslation();

  const direction = i18n.dir();

  const theme = React.useMemo(() => getTheme(direction), [direction]);
  const cache = React.useMemo(() => createEmotionCache(direction), [direction]);

  React.useEffect(() => {
    document.documentElement.dir = direction;
  }, [direction]);

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </CacheProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);