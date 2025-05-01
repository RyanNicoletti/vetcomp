import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getUserStatus, logoutUser } from "../queries/usersQueries";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  email: string | null;
  loading: boolean;
  login: (data: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    email: string;
  }) => void;
  logout: () => Promise<void>;
  refreshAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isAdmin: false,
    email: null as string | null,
    loading: true,
  });

  // initialize auth state on app load
  useEffect(() => {
    refreshAuthStatus();
  }, []);

  const refreshAuthStatus = async () => {
    try {
      const data = await getUserStatus();
      setAuthState({
        isAuthenticated: data.isAuthenticated,
        isAdmin: data.isAdmin,
        email: data.email,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch auth status:", error);
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        email: null,
        loading: false,
      });
    }
  };

  const login = (data: {
    isAuthenticated: boolean;
    isAdmin: boolean;
    email: string;
  }) => {
    setAuthState({
      isAuthenticated: data.isAuthenticated,
      isAdmin: data.isAdmin,
      email: data.email,
      loading: false,
    });
  };

  const logout = async () => {
    try {
      await logoutUser();
      setAuthState({
        isAuthenticated: false,
        isAdmin: false,
        email: null,
        loading: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        isAdmin: authState.isAdmin,
        email: authState.email,
        loading: authState.loading,
        login,
        logout,
        refreshAuthStatus,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
