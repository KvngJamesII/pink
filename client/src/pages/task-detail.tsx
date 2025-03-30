import { useParams } from 'wouter';
import { useAuthContext } from '@/context/AuthContext';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuthContext();
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Task Detail</h1>
      <div className="bg-card rounded-lg p-4 shadow-md">
        <p className="text-lg mb-2">Task ID: {id}</p>
        <p className="mb-4">This is a placeholder for the task detail page.</p>
        
        {user && (
          <div className="mt-6 p-4 bg-muted rounded-md">
            <h2 className="font-medium mb-2">Current User Info:</h2>
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Balance: ₦{user.walletBalance}</p>
          </div>
        )}
      </div>
    </div>
  );
}