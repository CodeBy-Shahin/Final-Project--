const publicApiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
const serverApiBaseUrl = process.env.INTERNAL_API_BASE_URL ?? publicApiBaseUrl;

export const API_BASE_URL = (typeof window === "undefined" ? serverApiBaseUrl : publicApiBaseUrl).replace(
  /\/$/,
  "",
);
