import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useLocation } from 'wouter';

interface TaskCardProps {
  id: number;
  name: string;
  ownerEmail: string;
  pricePerUser: number;
  totalSlots: number;
  filledSlots: number;
}

export default function TaskCard({ id, name, ownerEmail, pricePerUser, totalSlots, filledSlots }: TaskCardProps) {
  const [_, navigate] = useLocation();
  const progressPercentage = (filledSlots / totalSlots) * 100;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary">
      <CardContent className="p-4">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold">
            QR
          </div>
        </div>
        
        <h3 className="font-semibold text-center mb-2">{name}</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Task Owner:</span>
            <span>{ownerEmail}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price:</span>
            <span className="text-secondary font-semibold">₦{pricePerUser}</span>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-muted-foreground">Slots Left:</span>
              <span>{totalSlots - filledSlots}/{totalSlots}</span>
            </div>
            <Progress value={progressPercentage} className="h-2 gradient-bg" />
          </div>
        </div>
        
        <Button 
          onClick={() => navigate(`/task/${id}`)} 
          className="w-full py-2 mt-4 gradient-bg gradient-shine"
        >
          Start
        </Button>
      </CardContent>
    </Card>
  );
}
