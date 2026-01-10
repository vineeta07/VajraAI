import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MOCK_RISKS } from "./constants";
export const useRisks = () => useQuery({
  queryKey: ["risks"],
  queryFn: async () => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_RISKS;
  }
});
export const useUpdateRiskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { id, status };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["risks"],
        (old = []) => old.map((risk) => risk.id === data.id ? { ...risk, status: data.status } : risk)
      );
    }
  });
};
