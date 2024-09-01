import { Navigate, Outlet } from "react-router-dom";
import { useUserStatus } from "../../hooks/useUserStatus";

export const ProtectedRoute = () => {
  const { isAdmin, isLoading } = useUserStatus();

  if (isLoading) {
    return <div>loading...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};
