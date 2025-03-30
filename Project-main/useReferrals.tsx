import { useQuery } from '@tanstack/react-query';

export function useReferrals(userId?: number) {
  // Get user's referrals
  const {
    data: referralData,
    isLoading: isLoadingReferrals,
    error: referralsError,
  } = useQuery({
    queryKey: [`/api/users/${userId}/referrals`],
    enabled: !!userId,
  });
  
  return {
    referrals: referralData?.referrals || [],
    referralCount: referralData?.count || 0,
    referralEarnings: referralData?.earnings || 0,
    isLoadingReferrals,
    referralsError,
  };
}
