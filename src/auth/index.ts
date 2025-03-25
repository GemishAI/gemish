export * from "./client";
export * from "./server";
export * from "./constants";

// Export a flag to check if we're running on server or client
export const isServer = typeof window === "undefined";
