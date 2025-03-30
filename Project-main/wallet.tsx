import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/context/AuthContext';
import { useWallet } from '@/hooks/useWallet';
import FundWalletModal from '@/components/modals/FundWalletModal';
import WithdrawModal from '@/components/modals/WithdrawModal';
import TransactionItem from '@/components/TransactionItem';

export default function Wallet() {
  const [_, navigate] = useLocation();
  const { user } = useAuthContext();
  const { transactions, isLoadingTransactions } = useWallet(user?.id);
  
  const [showFundModal, setShowFundModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const hasNextPage = transactions?.pagination && page < transactions.pagination.pages;
  const hasPreviousPage = page > 1;
  
  return (
    <div>
      <header className="bg-card py-4 px-4 flex items-center shadow-md">
        <button onClick={() => navigate('/')} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Wallet</h1>
      </header>
      
      <main className="px-4 py-6">
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 shadow-md">
            <div className="text-muted-foreground mb-1">Wallet Balance</div>
            <div className="text-xl font-bold">₦{user?.walletBalance || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">For creating tasks</div>
          </div>
          
          <div className="bg-card rounded-lg p-4 shadow-md">
            <div className="text-muted-foreground mb-1">Withdrawal Balance</div>
            <div className="text-xl font-bold text-secondary">₦{user?.withdrawableBalance || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">Earnings from tasks</div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => setShowFundModal(true)} 
            className="gradient-bg gradient-shine"
          >
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Fund Wallet
          </Button>
          
          <Button 
            onClick={() => setShowWithdrawModal(true)} 
            className="bg-secondary hover:bg-secondary/90"
            disabled={!user?.withdrawableBalance || user.withdrawableBalance <= 0}
          >
            <ArrowDownRight className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
        </div>
        
        {/* Transaction History */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Transaction History</h2>
          
          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : transactions && transactions.transactions && transactions.transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.transactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  type={transaction.type}
                  amount={transaction.amount}
                  createdAt={transaction.createdAt}
                  status={transaction.status}
                />
              ))}
              
              {/* Pagination */}
              {(hasNextPage || hasPreviousPage) && (
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={!hasPreviousPage}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!hasNextPage}
                    className="text-primary"
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No transactions yet
            </div>
          )}
        </div>
      </main>
      
      <FundWalletModal isOpen={showFundModal} onClose={() => setShowFundModal(false)} />
      <WithdrawModal isOpen={showWithdrawModal} onClose={() => setShowWithdrawModal(false)} />
    </div>
  );
}
