import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuthContext } from '@/context/AuthContext';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  const { user } = useAuthContext();
  const { getWithdrawalAmounts, getNetworks, withdraw, isWithdrawing } = useWallet(user?.id);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [network, setNetwork] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };
  
  const handleNetworkChange = (value: string) => {
    setNetwork(value);
  };
  
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numeric input and max 11 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 11);
    setPhoneNumber(value);
  };
  
  const canSubmit = !!selectedAmount && !!network && phoneNumber.length === 11 && user?.withdrawableBalance && selectedAmount <= user.withdrawableBalance;
  
  const handleSubmit = () => {
    if (!canSubmit || !user) return;
    
    withdraw({
      userId: user.id,
      amount: selectedAmount,
      network,
      phoneNumber,
      newBalance: user.withdrawableBalance - selectedAmount
    });
    
    // Close the modal
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center border-b border-border pb-2">
          <DialogTitle>Withdraw Funds</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="py-4">
          <div className="text-center mb-4">
            <div className="text-muted-foreground">Available Balance</div>
            <div className="text-2xl font-bold text-secondary">₦{user?.withdrawableBalance || 0}</div>
          </div>
          
          <div className="mb-4">
            <div className="text-muted-foreground mb-2">Select Amount</div>
            <div className="grid grid-cols-3 gap-2">
              {getWithdrawalAmounts().map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={selectedAmount === amount ? "bg-secondary hover:bg-secondary/90" : ""}
                  onClick={() => handleAmountSelect(amount)}
                  disabled={user?.withdrawableBalance ? amount > user.withdrawableBalance : true}
                >
                  ₦{amount}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="network-select" className="block text-sm font-medium mb-1">
              Select Network
            </Label>
            <Select value={network} onValueChange={handleNetworkChange}>
              <SelectTrigger id="network-select">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                {getNetworks().map((network) => (
                  <SelectItem key={network} value={network}>
                    {network}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="phone-number" className="block text-sm font-medium mb-1">
              Phone Number
            </Label>
            <Input
              id="phone-number"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              placeholder="Enter 11-digit number"
              className="w-full"
              maxLength={11}
              inputMode="numeric"
            />
            {phoneNumber && phoneNumber.length !== 11 && (
              <p className="text-xs text-destructive mt-1">Phone number must be 11 digits</p>
            )}
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full bg-secondary hover:bg-secondary/90" 
            disabled={!canSubmit || isWithdrawing}
          >
            {isWithdrawing ? "Processing..." : "Withdraw"}
          </Button>
          
          {selectedAmount && user?.withdrawableBalance && selectedAmount > user.withdrawableBalance && (
            <p className="text-xs text-destructive mt-2 text-center">
              Insufficient balance. You can withdraw up to ₦{user.withdrawableBalance}.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
