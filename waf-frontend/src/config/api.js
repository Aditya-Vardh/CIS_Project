const FALLBACK_API_URL = "http://localhost:4000";

export const API_BASE_URL = (import.meta.env.VITE_API_URL || FALLBACK_API_URL).replace(/\/$/, "");
