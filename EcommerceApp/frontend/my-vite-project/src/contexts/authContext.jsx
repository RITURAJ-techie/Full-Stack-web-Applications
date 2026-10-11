
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem("shopnestToken");
    setUser(null);
  }, []);

  const request = useCallback(async (path, options = {}) => {
    const token = localStorage.getItem("shopnestToken");

    const response = await fetch(`${API_URL}/api/auth${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("shopnestToken", data.token);
    setUser(data.user);

    return data.user;
  }, [request]);

  const register = useCallback(async (name, email, password) => {
    const data = await request("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    localStorage.setItem("shopnestToken", data.token);
    setUser(data.user);

    return data.user;
  }, [request]);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const token = localStorage.getItem("shopnestToken");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await request("/me");

        if (active) setUser(data.user);
      } catch {
        if (active) {
          localStorage.removeItem("shopnestToken");
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, [request]);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
