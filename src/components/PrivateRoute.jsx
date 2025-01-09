import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../authStore.js";

const PrivateRoute = ({ children }) => {
  const { isAuth } = useAuthStore();

  return isAuth ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
