import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useNotifications(userId?: number) {
  const queryClient = useQueryClient();
  
  // Get user's notifications
  const {
    data: notifications,
    isLoading: isLoadingNotifications,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: [`/api/users/${userId}/notifications`],
    enabled: !!userId,
  });
  
  // Get unread notification count
  const {
    data: unreadCount,
    isLoading: isLoadingUnreadCount,
    error: unreadCountError,
    refetch: refetchUnreadCount,
  } = useQuery({
    queryKey: [`/api/users/${userId}/unread-notifications`],
    enabled: !!userId,
  });
  
  // Mark a notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (notificationId: number) => {
      const res = await apiRequest('POST', `/api/notifications/${notificationId}/read`, {});
      return res.json();
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/notifications`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/unread-notifications`] });
      }
    },
  });
  
  // Mark all notifications as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const res = await apiRequest('POST', `/api/users/${userId}/read-all-notifications`, {});
      return res.json();
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/notifications`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/unread-notifications`] });
      }
    },
  });
  
  return {
    notifications,
    isLoadingNotifications,
    notificationsError,
    refetchNotifications,
    unreadCount: unreadCount?.count || 0,
    isLoadingUnreadCount,
    unreadCountError,
    refetchUnreadCount,
    markAsRead,
    markAllAsRead,
  };
}
