export const getAuthStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/authStatus`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Server error.");
    }
    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return false;
  }
};

export const getAdminStatus = async (): Promise<boolean> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/adminStatus`,
      {
        method: "GET",
        credentials: "include",
      }
    );
    if (!response.ok) {
      throw new Error("Server error.");
    }
    const data = await response.json();
    return data.isAdmin;
  } catch (error) {
    console.error("Error fetching auth status:", error);
    return false;
  }
};
