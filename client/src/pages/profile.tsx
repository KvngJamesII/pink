import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function Profile() {
  const { user, logout } = useAuthContext();
  const [copied, setCopied] = useState(false);
  
  const copyReferralCode = () => {
    if (user) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  if (!user) {
    return (
      <div className="p-4 text-center">
        <p>Loading user profile...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-2xl font-bold mb-1">{user.name}</h1>
            <p className="text-muted-foreground mb-4">{user.email}</p>
            
            <div className="w-full p-3 bg-muted rounded-md flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Referral Code</p>
                <p className="font-medium">{user.referralCode}</p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={copyReferralCode}
                className="h-8 w-8"
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="font-bold">₦{user.walletBalance.toLocaleString()}</p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm text-muted-foreground">Withdrawable</p>
                <p className="font-bold">₦{user.withdrawableBalance.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="w-full space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="#">
                  My Tasks
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="#">
                  My Submissions
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="#">
                  Transaction History
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="#">
                  My Referrals
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            
            <Button 
              variant="destructive" 
              className="w-full mt-8"
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}