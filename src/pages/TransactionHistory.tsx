
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ITransaction } from '@/types';
import { getTransactionHistory } from '@/api/transactionService';
import TransactionDashboard from '@/components/TransactionDashboard';
import AppHeader from '@/components/AppHeader';
import { Link } from 'react-router-dom';
import { Calendar, Download, RotateCcw } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChain, setCurrentChain] = useState<'ethereum' | 'polygon'>('ethereum');
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch transactions from your backend
      // For demo purposes, we'll use mock data
      const response = await getTransactionHistory({
        limit: 20,
        offset: 0
      });
      
      // For this demo, we'll use the mock transactions from the import
      // In a real app, you'd use response.transactions
      import('@/utils/mockData').then(module => {
        setTransactions(module.mockTransactions);
        setIsLoading(false);
      });
      
    } catch (error) {
      toast({
        title: "Failed to load transactions",
        description: "Could not retrieve transaction history. Please try again later.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // In a real implementation, this would export transactions to a CSV or PDF
    toast({
      title: "Export Started",
      description: "Your transaction history is being exported.",
    });
    
    // Simulate export delay
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Transaction history has been exported successfully.",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader 
        walletAddress="0x1234...5678"
        onWalletConnect={() => {}}
        currentChain={currentChain}
        onChainChange={setCurrentChain}
      />
      
      <main className="container mx-auto px-4 pt-6 pb-12 flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Transaction History</h1>
            <p className="text-muted-foreground">
              View and analyze your blockchain transaction history
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadTransactions}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link to="/">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Date Range Filter</CardTitle>
              <CardDescription>Select a date range to filter transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date Range</span>
                  </div>
                  <Button variant="ghost" size="sm">Clear</Button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 items-center">
                  <div className="grid gap-2 w-full">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">From:</span>
                      <input 
                        type="date" 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 w-full">
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">To:</span>
                      <input 
                        type="date" 
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
                      />
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto">Apply Filter</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : (
            <TransactionDashboard transactions={transactions} />
          )}
        </div>
      </main>
      
      <footer className="py-4 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>Blockchain Fraud Detection System - BlockFraud © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default TransactionHistory;
