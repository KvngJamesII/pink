import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';

const taskSchema = z.object({
  name: z.string().min(3, 'Task name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  link: z.string().url('Please enter a valid URL'),
  totalSlots: z.coerce.number().int().min(1, 'Must need at least 1 user'),
  pricePerUser: z.coerce.number().int().min(100, 'Price must be at least ₦100'),
});

export default function CreateTask() {
  const [_, navigate] = useLocation();
  const { user } = useAuthContext();
  const { createTask, isCreatingTask } = useTasks(user?.id);
  
  const [totalRequired, setTotalRequired] = useState(0);
  
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      link: '',
      totalSlots: 1,
      pricePerUser: 100,
    },
  });
  
  useEffect(() => {
    const usersNeeded = form.watch('totalSlots') || 0;
    const price = form.watch('pricePerUser') || 0;
    setTotalRequired(usersNeeded * price);
  }, [form.watch('totalSlots'), form.watch('pricePerUser')]);
  
  const onSubmit = (values: z.infer<typeof taskSchema>) => {
    if (!user) return;
    
    if (user.walletBalance < totalRequired) {
      form.setError('root', {
        message: 'Insufficient funds in your wallet. Please fund your wallet first.'
      });
      return;
    }
    
    createTask({
      userId: user.id,
      name: values.name,
      description: values.description,
      link: values.link,
      totalSlots: values.totalSlots,
      pricePerUser: values.pricePerUser,
    });
    
    navigate('/');
  };
  
  const userBalance = user?.walletBalance || 0;
  const hasSufficientFunds = userBalance >= totalRequired;
  
  return (
    <div>
      <header className="bg-card py-4 px-4 flex items-center shadow-md">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Create Task</h1>
      </header>
      
      <main className="px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the task in detail" 
                          className="resize-none h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task Link</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalSlots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Users Needed</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1} 
                            {...field} 
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0) field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="pricePerUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price Per User (₦)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={100} 
                            {...field}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (value > 0) field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-muted p-4 rounded-lg mt-2">
                  <div className="flex justify-between">
                    <span>Total Required Amount:</span>
                    <span className="font-bold text-secondary">₦{totalRequired}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Your Wallet Balance:</span>
                    <span className={`font-bold ${hasSufficientFunds ? '' : 'text-destructive'}`}>₦{userBalance}</span>
                  </div>
                </div>
                
                {form.formState.errors.root && (
                  <div className="text-destructive text-sm">
                    {form.formState.errors.root.message}
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full gradient-bg gradient-shine"
                  disabled={isCreatingTask || !hasSufficientFunds}
                >
                  {isCreatingTask ? 'Creating Task...' : 'Create Task'}
                </Button>
                
                {!hasSufficientFunds && (
                  <div className="text-destructive text-sm text-center">
                    Insufficient funds. Please fund your wallet.
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
