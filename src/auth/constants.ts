export const BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://gemish.vercel.app";

export const AUTH_ROUTES = {
  SIGN_IN: "/auth/login",
  PROFILE: "/account",
  DASHBOARD: "/chat",
};
