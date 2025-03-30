import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function useTasks(userId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Get all available tasks
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ['/api/tasks'],
    enabled: true,
  });
  
  // Get a specific task
  const getTask = useCallback((taskId: number) => {
    return useQuery({
      queryKey: [`/api/tasks/${taskId}`],
      enabled: !!taskId,
    });
  }, []);
  
  // Create a new task
  const { mutate: createTask, isPending: isCreatingTask } = useMutation({
    mutationFn: async (taskData: any) => {
      const res = await apiRequest('POST', '/api/tasks', taskData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/transactions`] });
      }
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Task creation failed',
        description: error instanceof Error ? error.message : 'Failed to create task',
      });
    },
  });
  
  // Submit a task completion
  const { mutate: submitTask, isPending: isSubmittingTask } = useMutation({
    mutationFn: async ({ taskId, data }: { taskId: number, data: any }) => {
      const res = await apiRequest('POST', `/api/tasks/${taskId}/submit`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Task submitted',
        description: 'Your proof has been submitted for review',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: error instanceof Error ? error.message : 'Failed to submit task',
      });
    },
  });
  
  // Get tasks that need review (for task owners)
  const {
    data: pendingReviews,
    isLoading: isLoadingReviews,
    error: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: [`/api/users/${userId}/review-submissions`],
    enabled: !!userId,
  });
  
  // Review a task submission
  const { mutate: reviewSubmission, isPending: isReviewing } = useMutation({
    mutationFn: async ({ submissionId, status, reviewerId }: { submissionId: number, status: 'approved' | 'rejected', reviewerId: number }) => {
      const res = await apiRequest('POST', `/api/submissions/${submissionId}/review`, { status, reviewerId });
      return res.json();
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/review-submissions`] });
      }
      toast({
        title: 'Review submitted',
        description: 'The submission has been reviewed',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Review failed',
        description: error instanceof Error ? error.message : 'Failed to review submission',
      });
    },
  });
  
  // Get user's task submissions
  const {
    data: userSubmissions,
    isLoading: isLoadingUserSubmissions,
    error: userSubmissionsError,
  } = useQuery({
    queryKey: [`/api/users/${userId}/submissions`],
    enabled: !!userId,
  });
  
  return {
    tasks,
    isLoadingTasks,
    tasksError,
    refetchTasks,
    getTask,
    createTask,
    isCreatingTask,
    submitTask,
    isSubmittingTask,
    pendingReviews,
    isLoadingReviews,
    reviewsError,
    refetchReviews,
    reviewSubmission,
    isReviewing,
    userSubmissions,
    isLoadingUserSubmissions,
    userSubmissionsError,
  };
}
