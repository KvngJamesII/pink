import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Wallet() {
  const { user } = useAuthContext();
  const [tabValue, setTabValue] = useState('fund');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API delay
    setTimeout(() => {
      setIsSubmitting(false);
      alert(tabValue === 'fund' ? 'Fund request submitted!' : 'Withdrawal request submitted!');
    }, 1000);
  };
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      
      {user && (
        <div className="mb-6 p-5 bg-card rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Available Balance</h2>
            <span className="text-2xl font-bold gradient-text">₦{user.walletBalance.toLocaleString()}</span>
          </div>
          
          <div className="h-px w-full bg-border mb-4"></div>
          
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Withdrawable</h2>
            <span className="text-2xl font-bold">₦{user.withdrawableBalance.toLocaleString()}</span>
          </div>
        </div>
      )}
      
      <Tabs defaultValue="fund" className="w-full" onValueChange={setTabValue}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fund">Fund Wallet</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>
        
        <TabsContent value="fund">
          <Card>
            <CardHeader>
              <CardTitle>Fund Your Wallet</CardTitle>
              <CardDescription>Add money to your wallet to create tasks</CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₦)</Label>
                  <Input id="amount" type="number" min="100" placeholder="0" required />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <select id="method" className="w-full p-2 rounded-md border border-input bg-background">
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Credit Card</option>
                  </select>
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Fund Wallet'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
              <CardDescription>Withdraw your earnings to your bank account</CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="withdraw-amount">Amount (₦)</Label>
                  <Input 
                    id="withdraw-amount" 
                    type="number" 
                    min="500" 
                    max={user?.withdrawableBalance || 0} 
                    placeholder="0" 
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank">Bank</Label>
                  <select id="bank" className="w-full p-2 rounded-md border border-input bg-background">
                    <option value="">Select Bank</option>
                    <option value="zenith">Zenith Bank</option>
                    <option value="gtb">GTBank</option>
                    <option value="firstbank">First Bank</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account">Account Number</Label>
                  <Input id="account" placeholder="10-digit account number" minLength={10} maxLength={10} required />
                </div>
              </CardContent>
              
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Withdraw Funds'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}