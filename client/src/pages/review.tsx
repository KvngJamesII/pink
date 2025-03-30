import { useParams } from 'wouter';
import { useAuthContext } from '@/context/AuthContext';

export default function Review() {
  const { id } = useParams();
  const { user } = useAuthContext();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Review Submission</h1>
      <div className="bg-card rounded-lg p-4 shadow-md">
        <p className="text-lg mb-2">Submission ID: {id}</p>
        <p className="mb-4">This is a placeholder for the submission review page.</p>
        
        <div className="mt-4 space-y-4">
          <div className="p-3 bg-muted rounded-md">
            <h3 className="font-medium">Submission Details</h3>
            <p className="text-muted-foreground">User will see the task submission details here</p>
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <h3 className="font-medium">Review Controls</h3>
            <p className="text-muted-foreground">Controls for approving or rejecting submissions</p>
          </div>
        </div>
        
        {user && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <h2 className="font-medium mb-2">Reviewer Info:</h2>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
          </div>
        )}
      </div>
    </div>
  );
}