import { useQuery } from '@tanstack/react-query';

// Define the Task type based on your schema
type Task = {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  ownerEmail: string;
  pricePerUser: number;
  totalSlots: number;
  filledSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export function useTasks() {
  const { data, isLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    // For Netlify deployment - provide mock data to prevent loading state
    initialData: window.location.hostname.includes('netlify.app') 
      ? [
          {
            id: 1,
            name: 'Complete Marketing Survey',
            description: 'Fill out a brief survey about your shopping habits.',
            ownerId: 2,
            ownerEmail: 'business@example.com',
            pricePerUser: 500,
            totalSlots: 100,
            filledSlots: 45,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 2,
            name: 'App Testing Feedback',
            description: 'Test our new app and provide detailed feedback.',
            ownerId: 3,
            ownerEmail: 'developer@example.com',
            pricePerUser: 1200,
            totalSlots: 50,
            filledSlots: 23,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 3,
            name: 'Social Media Content Review',
            description: 'Review content for our social media campaign.',
            ownerId: 4,
            ownerEmail: 'marketing@example.com',
            pricePerUser: 800,
            totalSlots: 30,
            filledSlots: 8,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      : undefined
  });

  return {
    tasks: data || [],
    isLoadingTasks: isLoading && !data
  };
}