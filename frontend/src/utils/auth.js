export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getCurrentUser();
  if (!user) return "student";
  if (user.role) return user.role;
  return user.isAdmin ? "admin" : "student";
};

export const isAdminUser = () => getUserRole() === "admin";

export const isStudentUser = () => getUserRole() === "student";

export const getAuthToken = () =>
  localStorage.getItem("authToken") || localStorage.getItem("token") || "";

export const getAuthHeader = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
