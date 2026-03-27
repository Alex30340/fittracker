const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getToken = () => typeof window !== "undefined" ? localStorage.getItem("ft_token") : null;
export const setToken = (t: string | null) => { if (typeof window !== "undefined") t ? localStorage.setItem("ft_token", t) : localStorage.removeItem("ft_token"); };

async function f<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const h: any = { "Content-Type": "application/json", ...opts.headers };
  if (token) h["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers: h });
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(b.detail || `Error ${res.status}`); }
  return res.json();
}

// Auth
export const apiLogin = (email: string, pw: string) => f<any>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password: pw }) }).then(d => { setToken(d.token); return d; });
export const apiRegister = (email: string, pw: string, name?: string) => f<any>("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password: pw, display_name: name || "" }) }).then(d => { setToken(d.token); return d; });
export const apiGetMe = () => f<any>("/api/auth/me");
export const apiLogout = () => setToken(null);

// Products
export const getProducts = (params: Record<string, any> = {}) => { const qs = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") qs.set(k, String(v)); }); return f<{ total: number; products: any[] }>(`/api/products?${qs}`); };
export const getProduct = (id: number) => f<any>(`/api/products/${id}`);
export const getTopProducts = (n = 10) => f<{ products: any[] }>(`/api/products/top?limit=${n}`);
export const getRanking = (params: Record<string, any> = {}) => { const qs = new URLSearchParams(); Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") qs.set(k, String(v)); }); return f<{ total: number; ranking: any[] }>(`/api/products/ranking?${qs}`); };
export const getBrands = () => f<{ brands: any[] }>("/api/products/brands");

// Compare
export const compareProducts = (ids: number[]) => f<{ products: any[] }>("/api/compare", { method: "POST", body: JSON.stringify({ product_ids: ids }) });
export const getCompareSuggestions = () => f<{ suggestions: any[] }>("/api/compare/suggestions");

// Reviews
export const getReviews = (pid: number) => f<any>(`/api/reviews/product/${pid}`);
export const addReview = (data: any) => f<any>("/api/reviews", { method: "POST", body: JSON.stringify(data) });

// Favorites
export const getFavorites = () => f<{ favorites: any[] }>("/api/favorites");
export const toggleFavorite = (pid: number) => f<any>("/api/favorites/toggle", { method: "POST", body: JSON.stringify({ product_id: pid }) });

// Stats
export const getCatalogStats = () => f<any>("/api/stats/catalog");

// Fitness
export const calcTDEE = (data: any) => f<any>("/api/fitness/tdee", { method: "POST", body: JSON.stringify(data) });
export const calcExerciseCalories = (data: any) => f<any>("/api/fitness/calories", { method: "POST", body: JSON.stringify(data) });
export const calcSessionCalories = (exercises: any[]) => f<any>("/api/fitness/session-calories", { method: "POST", body: JSON.stringify({ exercises }) });

// Admin - Discovery batch system
export const discoveryStart = () => f<any>("/api/admin/discovery/start", { method: "POST" });
export const discoveryBatch = (run_id: number, batch_size: number = 5) =>
  f<any>("/api/admin/discovery/batch", { method: "POST", body: JSON.stringify({ run_id, batch_size }) });
export const discoveryStatus = (run_id: number) => f<any>(`/api/admin/discovery/status?run_id=${run_id}`);

// Admin - Legacy compat
export const startDiscovery = () => discoveryStart();
export const startRefresh = () => f<any>("/api/admin/refresh", { method: "POST" });
export const getPipelineRuns = (limit = 20) => f<any>(`/api/admin/pipeline-runs?limit=${limit}`);
export const getEnvCheck = () => f<any>("/api/admin/env-check");
