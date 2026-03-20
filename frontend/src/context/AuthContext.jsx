import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const storedUser = localStorage.getItem("bioguard_user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);

  }, []);

  const login = (userData) => {

    localStorage.setItem("bioguard_user", JSON.stringify(userData));

    setUser(userData);
  };

  const logout = () => {

    localStorage.removeItem("bioguard_user");

    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
