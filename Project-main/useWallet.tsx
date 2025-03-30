import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';

export function useWallet(userId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { updateUserData } = useAuthContext();
  
  // Get user's transactions
  const {
    data: transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery({
    queryKey: [`/api/users/${userId}/transactions`],
    enabled: !!userId,
  });
  
  // Fund wallet
  const { mutate: fundWallet, isPending: isFunding } = useMutation({
    mutationFn: async (fundData: any) => {
      const res = await apiRequest('POST', '/api/wallet/fund', fundData);
      return res.json();
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/transactions`] });
      }
      toast({
        title: 'Deposit request submitted',
        description: 'Your deposit is being processed. We will notify you when it is approved.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Deposit failed',
        description: error instanceof Error ? error.message : 'Failed to process deposit request',
      });
    },
  });
  
  // Withdraw
  const { mutate: withdraw, isPending: isWithdrawing } = useMutation({
    mutationFn: async (withdrawData: any) => {
      const res = await apiRequest('POST', '/api/wallet/withdraw', withdrawData);
      const data = await res.json();
      
      // Update user data with new balance
      updateUserData({
        withdrawableBalance: withdrawData.newBalance
      });
      
      return data;
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/transactions`] });
      }
      toast({
        title: 'Withdrawal request submitted',
        description: 'Your withdrawal is being processed. We will notify you when it is completed.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Withdrawal failed',
        description: error instanceof Error ? error.message : 'Failed to process withdrawal request',
      });
    },
  });
  
  // Get deposit preset amounts
  const getDepositAmounts = useCallback(() => {
    return [600, 1100, 1600, 2100, 3100, 5100];
  }, []);
  
  // Get withdrawal preset amounts
  const getWithdrawalAmounts = useCallback(() => {
    return [100, 200, 500, 1000, 1500, 2000];
  }, []);
  
  // Get available networks for withdrawal
  const getNetworks = useCallback(() => {
    return ['MTN', 'Airtel', 'Glo', '9mobile'];
  }, []);
  
  return {
    transactions,
    isLoadingTransactions,
    transactionsError,
    fundWallet,
    isFunding,
    withdraw,
    isWithdrawing,
    getDepositAmounts,
    getWithdrawalAmounts,
    getNetworks,
  };
}
