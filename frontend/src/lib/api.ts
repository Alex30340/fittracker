const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
  const { token, ...fetchOpts } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/api/v1${endpoint}`, {
    ...fetchOpts,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Erreur réseau" }));
    throw new Error(error.detail || `Erreur ${res.status}`);
  }

  return res.json();
}

// ============ AUTH ============

export async function register(email: string, password: string, displayName: string) {
  return fetchAPI("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
}

export async function login(email: string, password: string) {
  return fetchAPI("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function refreshToken(refreshToken: string) {
  return fetchAPI("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getMe(token: string) {
  return fetchAPI("/auth/me", { token });
}

// ============ PROFILE ============

export async function getProfile(token: string) {
  return fetchAPI("/profile", { token });
}

export async function updateProfile(token: string, data: Record<string, any>) {
  return fetchAPI("/profile", {
    method: "PUT",
    token,
    body: JSON.stringify(data),
  });
}

// ============ PRODUCTS ============

export async function getProducts(params: Record<string, any> = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== "")
  ).toString();
  return fetchAPI(`/products?${query}`);
}

export async function getProduct(id: number) {
  return fetchAPI(`/products/${id}`);
}

export async function getProductComments(id: number) {
  return fetchAPI(`/products/${id}/comments`);
}

export async function addProductComment(id: number, content: string, token: string, parentId?: number) {
  return fetchAPI(`/products/${id}/comments`, {
    method: "POST",
    token,
    body: JSON.stringify({ content, parent_id: parentId }),
  });
}

export async function toggleFavorite(id: number, token: string) {
  return fetchAPI(`/products/${id}/favorite`, { method: "POST", token });
}

export async function compareProducts(ids: number[]) {
  return fetchAPI(`/products/compare?ids=${ids.join(",")}`);
}

export async function getCategories() {
  return fetchAPI("/products/categories");
}

// ============ COACH ============

export async function generateProgram(token: string, data: Record<string, any>) {
  return fetchAPI("/coach/generate-program", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function getPrograms(token: string) {
  return fetchAPI("/coach/programs", { token });
}

export async function getProgram(token: string, id: number) {
  return fetchAPI(`/coach/programs/${id}`, { token });
}

export async function getExercises(params: Record<string, any> = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null)
  ).toString();
  return fetchAPI(`/coach/exercises?${query}`);
}

export async function logWorkout(token: string, data: Record<string, any>) {
  return fetchAPI("/coach/workouts/log", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function getWorkoutHistory(token: string, page = 1) {
  return fetchAPI(`/coach/workouts/history?page=${page}`, { token });
}

// ============ NUTRITION ============

export async function logFood(token: string, data: Record<string, any>) {
  return fetchAPI("/nutrition/log", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function getDailyNutrition(token: string, date?: string) {
  const query = date ? `?day=${date}` : "";
  return fetchAPI(`/nutrition/daily${query}`, { token });
}

// ============ METRICS ============

export async function addMetric(token: string, data: Record<string, any>) {
  return fetchAPI("/metrics", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function getMetrics(token: string, type = "weight", period = "90d") {
  return fetchAPI(`/metrics?type=${type}&period=${period}`, { token });
}

// ============ ACHIEVEMENTS ============

export async function getAchievements(token: string) {
  return fetchAPI("/achievements", { token });
}

export async function checkAchievements(token: string) {
  return fetchAPI("/achievements/check", { method: "POST", token });
}

// ============ NUTRITION PLANS ============

export async function generateNutritionPlan(token: string, data: Record<string, any>) {
  return fetchAPI("/nutrition/plans/generate", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export async function getNutritionPlans(token: string) {
  return fetchAPI("/nutrition/plans", { token });
}

export async function getActivePlan(token: string) {
  return fetchAPI("/nutrition/plans/active", { token });
}

export async function getShoppingList(token: string) {
  return fetchAPI("/nutrition/shopping-list", { token });
}
