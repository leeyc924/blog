const base = import.meta.env.BASE_URL.replace(/\/$/, "");

export function withBase(path: string): string {
  if (path.startsWith("http") || path.startsWith("#")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}
