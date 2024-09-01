import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserStatus, logoutUser } from "../queries/usersQueries";

export const useUserStatus = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["userStatus"],
    queryFn: getUserStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    try {
      await logoutUser();
      queryClient.setQueryData(["userStatus"], {
        isAuthenticated: false,
        isAdmin: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    isAdmin: data?.isAdmin ?? false,
    isLoading,
    logout,
  };
};
