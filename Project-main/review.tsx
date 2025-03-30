import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthContext } from '@/context/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const { user } = useAuthContext();
  const { pendingReviews, reviewSubmission, isReviewing } = useTasks(user?.id);
  const { toast } = useToast();
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    action: 'approve' | 'reject';
  }>({ isOpen: false, action: 'approve' });
  
  const submissionData = pendingReviews?.find(
    (item) => item.submission.id === parseInt(id)
  );
  
  if (!submissionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Submission not found or already reviewed.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  const { submission, task, submitterEmail } = submissionData;
  
  const handleReview = (status: 'approved' | 'rejected') => {
    setConfirmDialog({ isOpen: true, action: status });
  };
  
  const confirmReview = () => {
    if (!user) return;
    
    reviewSubmission({
      submissionId: submission.id,
      status: confirmDialog.action,
      reviewerId: user.id
    });
    
    setConfirmDialog({ isOpen: false, action: 'approve' });
    
    toast({
      title: confirmDialog.action === 'approved' ? 'Submission Approved' : 'Submission Rejected',
      description: confirmDialog.action === 'approved' 
        ? 'The user has been credited for the task completion.' 
        : 'The submission has been rejected.',
    });
    
    navigate('/');
  };
  
  return (
    <div>
      <header className="bg-card py-4 px-4 flex items-center shadow-md">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Review Submission</h1>
      </header>
      
      <main className="px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">{task.name}</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-muted-foreground mb-1">Submitted by:</div>
                <div className="font-medium">{submitterEmail}</div>
              </div>
              
              <div>
                <div className="text-muted-foreground mb-1">Proof of Completion:</div>
                {submission.proofText && (
                  <div className="bg-muted p-3 rounded-md mt-2">
                    {submission.proofText}
                  </div>
                )}
                
                {submission.proofImage && (
                  <div className="mt-3 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={submission.proofImage} 
                      alt="Proof screenshot" 
                      className="w-full h-auto max-h-60 object-contain"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => handleReview('rejected')} 
                  variant="destructive" 
                  className="w-1/2"
                  disabled={isReviewing}
                >
                  Reject
                </Button>
                <Button 
                  onClick={() => handleReview('approved')} 
                  className="w-1/2 bg-secondary hover:bg-secondary/90"
                  disabled={isReviewing}
                >
                  Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm {confirmDialog.action === 'approve' ? 'Approval' : 'Rejection'}</DialogTitle>
          </DialogHeader>
          <p>
            {confirmDialog.action === 'approve' 
              ? 'Are you sure you want to approve this submission? The user will be credited for the task completion.' 
              : 'Are you sure you want to reject this submission?'}
          </p>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReview}
              variant={confirmDialog.action === 'approve' ? 'default' : 'destructive'}
              className={confirmDialog.action === 'approve' ? 'bg-secondary hover:bg-secondary/90' : ''}
            >
              {confirmDialog.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
