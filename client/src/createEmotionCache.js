import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { prefixer } from "stylis";

export const createEmotionCache = (direction) =>
  createCache({
    key: direction === "rtl" ? "muirtl" : "muiltr",
    stylisPlugins: direction === "rtl" ? [prefixer, rtlPlugin] : [],
  });