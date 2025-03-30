import { formatDistanceToNow } from 'date-fns';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface TransactionItemProps {
  type: string;
  amount: number;
  createdAt: string;
  status: string;
}

export default function TransactionItem({ type, amount, createdAt, status }: TransactionItemProps) {
  const getTransactionIcon = () => {
    if (type === 'deposit' || type === 'task_credit' || type === 'referral_bonus') {
      return <ArrowUpRight className="text-secondary" />;
    } else if (type === 'withdrawal' || type === 'task_debit') {
      return <ArrowDownRight className="text-destructive" />;
    }
    return <ArrowRight />;
  };
  
  const getTransactionTitle = () => {
    switch (type) {
      case 'deposit':
        return 'Wallet Funded';
      case 'withdrawal':
        return 'Withdrawal';
      case 'task_credit':
        return 'Task Completed';
      case 'task_debit':
        return 'Task Created';
      case 'referral_bonus':
        return 'Referral Bonus';
      default:
        return 'Transaction';
    }
  };
  
  const getAmountColor = () => {
    if (type === 'deposit' || type === 'task_credit' || type === 'referral_bonus') {
      return 'text-green-400';
    } else if (type === 'withdrawal' || type === 'task_debit') {
      return 'text-destructive';
    }
    return '';
  };
  
  const getAmountPrefix = () => {
    if (type === 'deposit' || type === 'task_credit' || type === 'referral_bonus') {
      return '+';
    } else if (type === 'withdrawal' || type === 'task_debit') {
      return '-';
    }
    return '';
  };
  
  const date = new Date(createdAt);
  const timeAgo = formatDistanceToNow(date, { addSuffix: true });
  
  return (
    <div className="bg-card rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
          {getTransactionIcon()}
        </div>
        <div>
          <div className="font-medium">{getTransactionTitle()}</div>
          <div className="text-xs text-muted-foreground">
            {date.toLocaleDateString()} • {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {status !== 'completed' && ` • ${status}`}
          </div>
        </div>
      </div>
      <div className={`font-semibold ${getAmountColor()}`}>
        {getAmountPrefix()}₦{amount}
      </div>
    </div>
  );
}
