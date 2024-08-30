import { useQuery } from "@tanstack/react-query";
import { getAdminStatus } from "../../queries/authQueries";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["isAdmin"],
    queryFn: () => getAdminStatus(),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false,
  });

  if (isLoading) {
    return <div>loading...</div>;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" />;
};
