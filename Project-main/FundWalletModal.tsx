import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuthContext } from '@/context/AuthContext';

interface FundWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FundWalletModal({ isOpen, onClose }: FundWalletModalProps) {
  const { user } = useAuthContext();
  const { getDepositAmounts, fundWallet, isFunding } = useWallet(user?.id);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [paymentName, setPaymentName] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  
  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };
  
  const handleSubmit = () => {
    if (!selectedAmount || !user) return;
    
    // Convert file to base64 if available
    if (receipt) {
      const reader = new FileReader();
      reader.readAsDataURL(receipt);
      reader.onload = () => {
        fundWallet({
          userId: user.id,
          amount: selectedAmount,
          paymentName: paymentName || null,
          paymentReceipt: reader.result
        });
      };
    } else {
      fundWallet({
        userId: user.id,
        amount: selectedAmount,
        paymentName: paymentName || null
      });
    }
    
    // Close the modal
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex justify-between items-center border-b border-border pb-2">
          <DialogTitle>Fund Wallet</DialogTitle>
          <button onClick={onClose} className="text-muted-foreground">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="text-muted-foreground mb-2">Select Amount</div>
            <div className="grid grid-cols-3 gap-2">
              {getDepositAmounts().map((amount) => (
                <Button
                  key={amount}
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={selectedAmount === amount ? "gradient-bg" : ""}
                  onClick={() => handleAmountSelect(amount)}
                >
                  ₦{amount}
                </Button>
              ))}
            </div>
          </div>
          
          {selectedAmount && (
            <>
              <div className="bg-muted p-4 rounded-lg text-sm mb-4">
                <div className="font-medium mb-2">Make a payment of ₦{selectedAmount} into the bank below:</div>
                <div>✅ 1006897571</div>
                <div>🏦 LOTUS BANK</div>
                <div>👤 ADEDAYO</div>
                <div className="text-muted-foreground mt-2">Kindly note, a service fee of ₦100 will be deducted.</div>
              </div>
              
              <div className="mb-4">
                <Label htmlFor="payment-name" className="block text-sm font-medium mb-1">
                  Name Used For Transfer
                </Label>
                <Input
                  id="payment-name"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  placeholder="Enter name used for transfer"
                  className="w-full"
                />
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-muted-foreground mb-1">Or Upload Payment Receipt</div>
                <div className="border border-dashed border-border rounded-lg p-4 text-center bg-muted cursor-pointer">
                  <input 
                    type="file" 
                    id="receipt-input" 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <label htmlFor="receipt-input" className="cursor-pointer">
                    <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                    <p className="text-sm text-muted-foreground">
                      {receipt ? receipt.name : "Click to upload receipt"}
                    </p>
                  </label>
                </div>
              </div>
              
              <Button 
                onClick={handleSubmit} 
                className="w-full gradient-bg gradient-shine" 
                disabled={isFunding}
              >
                {isFunding ? "Processing..." : "I've made payment"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
