import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("pw_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("pw_token", token);
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((data) => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setToken("");
          setUser(null);
          localStorage.removeItem("pw_token");
          setLoading(false);
        });
    } else {
      localStorage.removeItem("pw_token");
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, role) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("pw_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
