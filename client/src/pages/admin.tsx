import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

export default function Admin() {
  const { user } = useAuthContext();
  const [, navigate] = useLocation();
  
  // Redirect if not admin
  if (user && user.role !== 'admin') {
    setTimeout(() => navigate('/'), 0);
    return null;
  }
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">This is a placeholder for the user management table.</p>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-medium">User Demo</h3>
                      <p className="text-sm text-muted-foreground">demo@example.com</p>
                    </div>
                    <Button variant="outline" size="sm">Ban User</Button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm">Update Balance</Button>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deposits">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Requests</CardTitle>
              <CardDescription>Pending deposit requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">This is a placeholder for deposit requests.</p>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-medium">₦5,000 Deposit</h3>
                      <p className="text-sm text-muted-foreground">From: user@example.com</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">Approve</Button>
                      <Button variant="outline" size="sm">Reject</Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Payment Reference: TX123456</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Pending withdrawal requests from users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">This is a placeholder for withdrawal requests.</p>
                
                <div className="p-4 border rounded-md">
                  <div className="flex justify-between mb-2">
                    <div>
                      <h3 className="font-medium">₦2,500 Withdrawal</h3>
                      <p className="text-sm text-muted-foreground">To: user@example.com</p>
                    </div>
                    <Button variant="default" size="sm">Process</Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Bank: GTBank • Account: 1234567890</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}