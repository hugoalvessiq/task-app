import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import { useTaskContext } from "../context/TaskContext";

const ProtectedRoute = ({ children }) => {
  const { token } = useAuthContext();

  if (!token) {
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

export default ProtectedRoute;
