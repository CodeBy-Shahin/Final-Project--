const DEFAULT_BACKEND_ORIGIN = "http://localhost";
const DEFAULT_BACKEND_PORT = "5000";
const DEFAULT_API_PATH = "/api";

function getEnvValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  const normalized = trimmed ? trimmed : DEFAULT_API_PATH;
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

function normalizeOrigin(origin: string, port?: string) {
  try {
    const url = new URL(origin);

    if (port && !url.port) {
      url.port = port;
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    const withoutTrailingSlash = origin.replace(/\/$/, "");
    const hasPort = /:\d+$/.test(withoutTrailingSlash);
    return port && !hasPort ? `${withoutTrailingSlash}:${port}` : withoutTrailingSlash;
  }
}

function buildApiBaseUrl(options: {
  apiBaseUrl?: string;
  backendOrigin?: string;
  backendPort?: string;
  apiPath?: string;
}) {
  const apiBaseUrl = getEnvValue(options.apiBaseUrl);

  if (apiBaseUrl) {
    return apiBaseUrl.replace(/\/$/, "");
  }

  const backendOrigin = normalizeOrigin(
    getEnvValue(options.backendOrigin) ?? DEFAULT_BACKEND_ORIGIN,
    getEnvValue(options.backendPort) ?? DEFAULT_BACKEND_PORT,
  );
  const apiPath = normalizePath(getEnvValue(options.apiPath) ?? DEFAULT_API_PATH);

  return `${backendOrigin}${apiPath}`;
}

const publicApiBaseUrl = buildApiBaseUrl({
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  backendOrigin: process.env.NEXT_PUBLIC_BACKEND_ORIGIN,
  backendPort: process.env.NEXT_PUBLIC_BACKEND_PORT,
  apiPath: process.env.NEXT_PUBLIC_API_PATH,
});

const serverApiBaseUrl =
  getEnvValue(process.env.INTERNAL_API_BASE_URL) ??
  getEnvValue(process.env.API_BASE_URL)?.replace(/\/$/, "") ??
  (getEnvValue(process.env.BACKEND_ORIGIN) || getEnvValue(process.env.BACKEND_PORT) || getEnvValue(process.env.API_PATH)
    ? buildApiBaseUrl({
        backendOrigin: process.env.BACKEND_ORIGIN,
        backendPort: process.env.BACKEND_PORT,
        apiPath: process.env.API_PATH,
      })
    : publicApiBaseUrl);

export const API_BASE_URL = typeof window === "undefined" ? serverApiBaseUrl : publicApiBaseUrl;
