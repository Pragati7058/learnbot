import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKeyState] = useState(() => sessionStorage.getItem("lb_groq") || "");

  useEffect(() => {
    const token = localStorage.getItem("lb_token");
    if (token) {
      api.me()
        .then(d => setUser(d.user))
        .catch(() => localStorage.removeItem("lb_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const d = await api.login({ email, password });
    localStorage.setItem("lb_token", d.token);
    setUser(d.user);
    if (d.user.apiKey) setApiKeyState(d.user.apiKey);
    return d.user;
  };

  const register = async (name, email, password) => {
    const d = await api.register({ name, email, password });
    localStorage.setItem("lb_token", d.token);
    setUser(d.user);
    return d.user;
  };

  const logout = () => {
    localStorage.removeItem("lb_token");
    sessionStorage.removeItem("lb_groq");
    setUser(null);
    setApiKeyState("");
  };

  const setApiKey = (key) => {
    sessionStorage.setItem("lb_groq", key);
    setApiKeyState(key);
    // Optionally persist to server
    api.saveApiKey(key).catch(() => {});
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, apiKey, setApiKey }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
