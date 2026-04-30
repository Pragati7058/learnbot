import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiKey, setApiKeyState] = useState(() => sessionStorage.getItem("lb_groq") || import.meta.env.VITE_GROQ_API_KEY || "");

  useEffect(() => {
    const token = localStorage.getItem("lb_token");
    if (token) {
      api.me()
        .then(d => {
          setUser(d.user);
          if (d.user?.apiKey) setApiKeyState(d.user.apiKey);
        })
        .catch(() => {
          localStorage.removeItem("lb_token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const d = await api.login({ email, password });
    localStorage.setItem("lb_token", d.token);
    setUser(d.user);
    if (d.user?.apiKey) setApiKeyState(d.user.apiKey);
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
    setApiKeyState(import.meta.env.VITE_GROQ_API_KEY || "");
  };

  const setApiKey = (key) => {
    sessionStorage.setItem("lb_groq", key);
    setApiKeyState(key);
    api.saveApiKey(key).catch(() => {});
  };

  const forgotPassword = async (email) => {
    return await api.forgot({ email });
  };

  const resetPassword = async (token, password, confirmPassword) => {
    return await api.reset(token, { password, confirmPassword });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      apiKey,
      login,
      register,
      logout,
      setApiKey,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);