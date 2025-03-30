import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function CreateTask() {
  const { user } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      // In a real implementation, this would navigate to the task details page
      alert('Task created successfully!');
    }, 1000);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Task</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Create a new task for users to complete</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name</Label>
              <Input id="name" placeholder="Enter task name" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what users need to do to complete this task"
                className="min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per User (₦)</Label>
                <Input
                  id="price"
                  type="number"
                  min="1"
                  placeholder="0"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slots">Total Slots</Label>
                <Input
                  id="slots"
                  type="number"
                  min="1"
                  placeholder="1"
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {user && (
        <div className="mt-6 p-4 bg-muted rounded-md">
          <h2 className="font-medium mb-2">Creator Info:</h2>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Balance: ₦{user.walletBalance}</p>
        </div>
      )}
    </div>
  );
}