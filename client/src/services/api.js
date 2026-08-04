import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRedirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authenticationFailureCodes = new Set([
      "AUTH_TOKEN_MISSING",
      "AUTH_TOKEN_EXPIRED",
      "AUTH_TOKEN_INVALID",
      "AUTH_USER_NOT_FOUND",
    ]);
    const errorCode = error.response?.data?.code;
    const hasSavedSession = Boolean(
      localStorage.getItem("token") || localStorage.getItem("user")
    );

    if (
      authenticationFailureCodes.has(errorCode) &&
      hasSavedSession &&
      !isRedirectingToLogin
    ) {
      isRedirectingToLogin = true;

      const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      localStorage.removeItem("user");
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        sessionStorage.setItem("authRedirectPath", currentPath);
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

export default api;
