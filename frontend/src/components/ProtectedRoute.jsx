import { Navigate } from "react-router-dom";

// Simple role-based route protection using localStorage
const ProtectedRoute = ({ allowedRole, allowedRoles, children }) => {
  const role = localStorage.getItem("role");

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    if (!allowedRoles.includes(role)) {
      return <Navigate to="/login" replace />;
    }
  } else if (allowedRole) {
    if (role !== allowedRole) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

