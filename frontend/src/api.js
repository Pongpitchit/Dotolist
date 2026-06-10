const BASE = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || "Error");
  }
  return res.json();
}

export const api = {
  login: (data) => req("/auth/login", { method: "POST", body: data }),
  register: (data) => req("/auth/register", { method: "POST", body: data }),
  me: () => req("/auth/me"),
  users: () => req("/auth/users"),

  tasks: (params = {}) => req("/tasks?" + new URLSearchParams(params)),
  taskStats: () => req("/tasks/stats/today"),
  activeUsers: () => req("/tasks/active-users"),
  createTask: (data) => req("/tasks", { method: "POST", body: data }),
  updateTask: (id, data) => req(`/tasks/${id}`, { method: "PATCH", body: data }),
  deleteTask: (id) => req(`/tasks/${id}`, { method: "DELETE" }),

  projects: () => req("/projects"),
  createProject: (data) => req("/projects", { method: "POST", body: data }),
  deleteProject: (id) => req(`/projects/${id}`, { method: "DELETE" }),
};
