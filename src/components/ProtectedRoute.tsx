import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const ProtectedRoute: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return null;
  }

  const { authData } = authContext;

  return authData ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
