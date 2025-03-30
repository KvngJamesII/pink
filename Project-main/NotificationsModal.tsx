import { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/context/AuthContext';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { user } = useAuthContext();
  const { 
    notifications, 
    isLoadingNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications(user?.id);
  
  // Mark all as read when opening the modal
  useEffect(() => {
    if (isOpen && user) {
      markAllAsRead();
    }
  }, [isOpen, user, markAllAsRead]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center border-b border-border pb-2">
          <DialogTitle>Notifications</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          {isLoadingNotifications ? (
            <div className="py-8 text-center text-muted-foreground">Loading notifications...</div>
          ) : notifications && notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} className={`p-4 border-b border-border ${notification.isRead ? '' : 'bg-muted/20'}`}>
                  <div className="font-medium">{notification.message}</div>
                  <div className="text-muted-foreground text-xs mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">No notifications yet</div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
