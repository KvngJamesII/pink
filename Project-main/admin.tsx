import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Search, Users, SquareStack, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  email: string;
  walletBalance: number;
  withdrawableBalance: number;
  isAdmin: boolean;
  isBanned: boolean;
  referralCode: string;
}

interface Transaction {
  id: number;
  userId: number;
  userEmail: string;
  type: string;
  amount: number;
  status: string;
  network?: string;
  phoneNumber?: string;
  paymentName?: string;
  paymentReceipt?: string;
  createdAt: string;
}

export default function Admin() {
  const [_, navigate] = useLocation();
  const { user } = useAuthContext();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Check if the user is admin
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You do not have permission to access the admin panel.'
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  // Fetch admin data
  useEffect(() => {
    if (!user || !user.isAdmin) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch users
        const usersRes = await apiRequest('GET', `/api/admin/users?adminId=${user.id}`);
        const usersData = await usersRes.json();
        setUsers(usersData);
        
        // Fetch deposit requests
        const depositsRes = await apiRequest('GET', `/api/admin/deposit-requests?adminId=${user.id}`);
        const depositsData = await depositsRes.json();
        setDeposits(depositsData);
        
        // Fetch withdrawal requests
        const withdrawalsRes = await apiRequest('GET', `/api/admin/withdrawal-requests?adminId=${user.id}`);
        const withdrawalsData = await withdrawalsRes.json();
        setWithdrawals(withdrawalsData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to fetch admin data'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, toast]);
  
  // Handle ban/unban user
  const handleBanUser = async (userId: number, isBanned: boolean) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/admin/ban-user', {
        adminId: user.id,
        userId,
        isBanned
      });
      
      // Update users list
      setUsers(users.map(u => u.id === userId ? { ...u, isBanned } : u));
      
      toast({
        title: isBanned ? 'User Banned' : 'User Unbanned',
        description: `User has been ${isBanned ? 'banned' : 'unbanned'} successfully.`
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to ${isBanned ? 'ban' : 'unban'} user`
      });
    }
  };
  
  // Handle approve deposit
  const handleApproveDeposit = async (transactionId: number) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/admin/approve-deposit', {
        adminId: user.id,
        transactionId
      });
      
      // Update deposits list
      setDeposits(deposits.filter(d => d.id !== transactionId));
      
      toast({
        title: 'Deposit Approved',
        description: 'The deposit has been approved and the user has been credited.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to approve deposit'
      });
    }
  };
  
  // Handle reject deposit
  const handleRejectDeposit = async (transactionId: number) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/admin/reject-deposit', {
        adminId: user.id,
        transactionId
      });
      
      // Update deposits list
      setDeposits(deposits.filter(d => d.id !== transactionId));
      
      toast({
        title: 'Deposit Rejected',
        description: 'The deposit has been rejected.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject deposit'
      });
    }
  };
  
  // Handle process withdrawal
  const handleProcessWithdrawal = async (transactionId: number) => {
    if (!user) return;
    
    try {
      await apiRequest('POST', '/api/admin/process-withdrawal', {
        adminId: user.id,
        transactionId
      });
      
      // Update withdrawals list
      setWithdrawals(withdrawals.filter(w => w.id !== transactionId));
      
      toast({
        title: 'Withdrawal Processed',
        description: 'The withdrawal has been processed successfully.'
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to process withdrawal'
      });
    }
  };
  
  // Filter users by search query
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.referralCode.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div>
      <header className="bg-card py-4 px-4 flex items-center shadow-md">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </header>
      
      <main className="px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <SquareStack className="h-4 w-4 mr-2" />
                Pending Deposits
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{deposits.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Pending Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">{withdrawals.length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by email or referral code..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="deposits">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>
          
          {/* Users Tab */}
          <TabsContent value="users">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-4">
                {filteredUsers.map((userData) => (
                  <Card key={userData.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{userData.email}</h3>
                          <div className="text-sm text-muted-foreground">
                            ID: {userData.referralCode} • 
                            {userData.isAdmin && ' Admin •'}
                            {userData.isBanned && ' Banned'}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="text-muted-foreground">Wallet: </span>
                            <span>₦{userData.walletBalance}</span>
                            <span className="text-muted-foreground ml-2">Withdrawable: </span>
                            <span>₦{userData.withdrawableBalance}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {userData.isBanned ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleBanUser(userData.id, false)}
                            >
                              Unban
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleBanUser(userData.id, true)}
                            >
                              Ban
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </TabsContent>
          
          {/* Deposits Tab */}
          <TabsContent value="deposits">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : deposits.length > 0 ? (
              <div className="space-y-4">
                {deposits.map((deposit) => (
                  <Card key={deposit.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{deposit.userEmail}</h3>
                          <span className="text-primary font-bold">₦{deposit.amount}</span>
                        </div>
                        
                        {deposit.paymentName && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Payment Name: </span>
                            <span>{deposit.paymentName}</span>
                          </div>
                        )}
                        
                        {deposit.paymentReceipt && (
                          <div className="mt-2">
                            <img 
                              src={deposit.paymentReceipt} 
                              alt="Payment receipt" 
                              className="max-h-32 rounded-md"
                            />
                          </div>
                        )}
                        
                        <div className="text-xs text-muted-foreground">
                          {new Date(deposit.createdAt).toLocaleString()}
                        </div>
                        
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="w-1/2"
                            onClick={() => handleRejectDeposit(deposit.id)}
                          >
                            Reject
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-1/2 bg-secondary hover:bg-secondary/90"
                            onClick={() => handleApproveDeposit(deposit.id)}
                          >
                            Approve
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending deposits
              </div>
            )}
          </TabsContent>
          
          {/* Withdrawals Tab */}
          <TabsContent value="withdrawals">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : withdrawals.length > 0 ? (
              <div className="space-y-4">
                {withdrawals.map((withdrawal) => (
                  <Card key={withdrawal.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{withdrawal.userEmail}</h3>
                          <span className="text-destructive font-bold">₦{withdrawal.amount}</span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Network: </span>
                          <span>{withdrawal.network}</span>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-muted-foreground">Phone: </span>
                          <span>{withdrawal.phoneNumber}</span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {new Date(withdrawal.createdAt).toLocaleString()}
                        </div>
                        
                        <Button 
                          size="sm" 
                          className="mt-2 bg-secondary hover:bg-secondary/90"
                          onClick={() => handleProcessWithdrawal(withdrawal.id)}
                        >
                          Process Withdrawal
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No pending withdrawals
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
