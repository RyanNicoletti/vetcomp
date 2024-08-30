import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserStatus } from "../../queries/usersQueries";

export const useUserStatus = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["userStatus"],
    queryFn: getUserStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const logout = () => {
    queryClient.setQueryData(["userStatus"], {
      isAuthenticated: false,
      isAdmin: false,
    });
  };

  return {
    isAuthenticated: data?.isAuthenticated ?? false,
    isAdmin: data?.isAdmin ?? false,
    isLoading,
    logout,
  };
};
