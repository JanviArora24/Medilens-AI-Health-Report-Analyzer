import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // 🔄 Restore auth state on refresh
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);

        setToken(savedToken);
        setUser({
          email: decoded.email,
          name: decoded.name,
          userId: decoded.user_id,
        });
        setIsAuthenticated(true);
      } catch (err) {
        // Invalid / expired token
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  }, []);

  // 🔐 Login handler
  const login = (jwt) => {
    const decoded = jwtDecode(jwt);

    localStorage.setItem("token", jwt);
    setToken(jwt);
    setUser({
      email: decoded.email,
      name: decoded.name,
      userId: decoded.user_id,
    });
    setIsAuthenticated(true);
  };

  // 🚪 Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
