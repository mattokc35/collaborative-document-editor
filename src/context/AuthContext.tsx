import React, { createContext, useState, useEffect, ReactNode } from "react";

interface AuthContextType {
  authData: string | null;
  setAuthData: (authData: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authData, setAuthData] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuthData(token);
    }
  }, []);

  useEffect(() => {
    if (authData) {
      localStorage.setItem("authToken", authData);
    } else {
      localStorage.removeItem("authToken");
    }
  }, [authData]);

  return (
    <AuthContext.Provider value={{ authData, setAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
