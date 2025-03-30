import { useState } from 'react';
import { Link } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().length(6, { message: 'Password must be exactly 6 characters' }),
});

export default function Login() {
  const { login, isLoading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setError(null);
    try {
      await login(values);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
    }
  };
  
  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8 gradient-text">QuicReF</h1>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-6">Login</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password (6 digits)</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="6-digit password" 
                          maxLength={6}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <div className="text-sm text-destructive">{error}</div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full gradient-bg gradient-shine"
                  disabled={isLoading}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </Form>
            
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">
                Don't have an account? 
                <Link href="/signup" className="text-primary font-medium ml-1">
                  Sign up here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
