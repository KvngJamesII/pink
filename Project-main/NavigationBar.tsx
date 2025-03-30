import { useState } from 'react';
import { Plus, Wallet, BellRing } from 'lucide-react';
import { useLocation } from 'wouter';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/context/AuthContext';
import NotificationsModal from './modals/NotificationsModal';

export default function NavigationBar() {
  const [_, navigate] = useLocation();
  const { user } = useAuthContext();
  const { unreadCount } = useNotifications(user?.id);
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-6 py-3 flex justify-between items-center z-10">
        <button 
          className="nav-circle"
          onClick={() => navigate('/wallet')}
        >
          <Wallet className="h-5 w-5 text-foreground" />
        </button>
        
        <button 
          className="nav-circle large gradient-shine"
          onClick={() => navigate('/create-task')}
        >
          <Plus className="h-6 w-6 text-white" />
        </button>
        
        <button 
          className="nav-circle relative"
          onClick={() => setShowNotifications(true)}
        >
          <BellRing className="h-5 w-5 text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full text-xs flex items-center justify-center text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </nav>
      
      <NotificationsModal 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </>
  );
}
