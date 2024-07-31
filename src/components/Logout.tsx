import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (authContext) {
      authContext.logout();
    }
    localStorage.removeItem("authToken");
    navigate("/login");
  }, [authContext, navigate]);

  return null;
};

export default Logout;
