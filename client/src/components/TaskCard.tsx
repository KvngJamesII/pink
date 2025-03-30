import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckSquare } from 'lucide-react';

interface TaskCardProps {
  id: number;
  name: string;
  ownerEmail: string;
  pricePerUser: number;
  totalSlots: number;
  filledSlots: number;
}

const TaskCard: React.FC<TaskCardProps> = ({
  id,
  name,
  ownerEmail,
  pricePerUser,
  totalSlots,
  filledSlots
}) => {
  const progress = (filledSlots / totalSlots) * 100;
  
  return (
    <Link href={`/task/${id}`}>
      <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="text-base font-semibold mb-1">{name}</h3>
            <Badge variant="outline" className="text-xs font-normal">
              ₦{pricePerUser}
            </Badge>
          </div>
          
          <p className="text-xs text-muted-foreground mb-3">by {ownerEmail}</p>
          
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckSquare className="h-3 w-3 mr-1" /> 
              <span>{filledSlots}/{totalSlots} spots filled</span>
            </div>
            
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TaskCard;