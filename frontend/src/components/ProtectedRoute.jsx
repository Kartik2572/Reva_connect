import { Navigate } from "react-router-dom";

// Simple role-based route protection using localStorage
const ProtectedRoute = ({ allowedRole, children }) => {
  const role = localStorage.getItem("role");

  if (!role || role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

