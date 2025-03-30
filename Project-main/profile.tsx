import { useLocation } from 'wouter';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthContext } from '@/context/AuthContext';
import { useReferrals } from '@/hooks/useReferrals';

function getInitial(email: string) {
  return email.charAt(0).toUpperCase();
}

export default function Profile() {
  const [_, navigate] = useLocation();
  const { user, logout } = useAuthContext();
  const { toast } = useToast();
  
  const {
    referralCount,
    referralEarnings,
    isLoadingReferrals
  } = useReferrals(user?.id);
  
  const copyReferralCode = () => {
    if (!user) return;
    
    navigator.clipboard.writeText(user.referralCode);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard"
    });
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div>
      <header className="bg-card py-4 px-4 flex items-center shadow-md">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Profile</h1>
      </header>
      
      <main className="px-4 py-6">
        {/* User Info */}
        <div className="bg-card rounded-lg p-6 shadow-md flex flex-col items-center">
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-white text-2xl font-bold mb-4">
            {user ? getInitial(user.email) : '?'}
          </div>
          
          <div className="text-center">
            <h2 className="text-lg font-semibold">{user?.email}</h2>
            <div className="text-muted-foreground text-sm mt-1">
              User ID: <span className="text-primary">{user?.referralCode}</span>
            </div>
          </div>
        </div>
        
        {/* Referral Section */}
        <div className="bg-card rounded-lg p-6 shadow-md mt-6">
          <h2 className="text-lg font-semibold mb-4">Referral Program</h2>
          
          {isLoadingReferrals ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold">{referralCount}</div>
                  <div className="text-sm text-muted-foreground">Users Invited</div>
                </div>
                
                <div className="bg-muted rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-secondary">₦{referralEarnings}</div>
                  <div className="text-sm text-muted-foreground">Earnings</div>
                </div>
              </div>
              
              <div className="bg-muted p-4 rounded-lg mt-4">
                <div className="text-muted-foreground mb-1">Your Referral Code</div>
                <div className="flex justify-between items-center">
                  <div className="font-bold text-lg">{user?.referralCode}</div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyReferralCode}
                    className="hover:bg-primary hover:text-white px-3 py-1 h-auto text-sm rounded-lg"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4 p-3 bg-primary/10 rounded-lg">
                Invite your friends and earn 5% withdrawable bonus anytime they make a deposit.
              </div>
            </>
          )}
        </div>
        
        {/* Log Out Button */}
        <Button 
          variant="destructive" 
          className="w-full mt-6"
          onClick={handleLogout}
        >
          Log Out
        </Button>

        {/* Admin Panel Link (only for admin users) */}
        {user?.isAdmin && (
          <Button 
            variant="outline" 
            className="w-full mt-4 border-primary text-primary hover:bg-primary/10"
            onClick={() => navigate('/admin')}
          >
            Admin Panel
          </Button>
        )}
      </main>
    </div>
  );
}
