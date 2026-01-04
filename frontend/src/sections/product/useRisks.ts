import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { MOCK_RISKS } from './constants';

import type { RiskAnomaly, RiskStatus } from './types';

export const useRisks = () => useQuery<RiskAnomaly[]>({
    queryKey: ['risks'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_RISKS;
    },
  });

export const useUpdateRiskStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RiskStatus }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, status };
    },
    onSuccess: (data: { id: string; status: RiskStatus }) => {
      queryClient.setQueryData<RiskAnomaly[]>(['risks'], (old = []) =>
        old.map(risk => risk.id === data.id ? { ...risk, status: data.status } : risk)
      );
    }
  });
};
