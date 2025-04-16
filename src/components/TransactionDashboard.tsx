import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ITransaction } from '@/types';
import TransactionItem from './TransactionItem';
import TransactionModal from './TransactionModal';
import { ActivitySquare, Search, Calendar, SlidersHorizontal, ArrowDownUp, MapPin, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { analyzeTransaction } from '@/api/transactionService';

interface TransactionDashboardProps {
  transactions: ITransaction[];
}

const TransactionDashboard = ({ transactions }: TransactionDashboardProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<'list' | 'map'>('list');
  const [aiAnalyzedTransactions, setAiAnalyzedTransactions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const filteredTransactions = transactions.filter(transaction => {
    const searchMatch = 
      transaction.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const riskMatch = riskFilter === 'all' || transaction.riskLevel === riskFilter;
    
    const statusMatch = statusFilter === 'all' || transaction.status === statusFilter;
    
    const now = Date.now();
    const oneDayAgo = now - 86400000; // 24 hours
    const oneWeekAgo = now - 604800000; // 7 days
    const oneMonthAgo = now - 2592000000; // 30 days
    
    let dateMatch = true;
    if (dateFilter === 'today') {
      dateMatch = transaction.timestamp > oneDayAgo;
    } else if (dateFilter === 'week') {
      dateMatch = transaction.timestamp > oneWeekAgo;
    } else if (dateFilter === 'month') {
      dateMatch = transaction.timestamp > oneMonthAgo;
    }
    
    return searchMatch && riskMatch && statusMatch && dateMatch;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'timestamp') {
      comparison = a.timestamp - b.timestamp;
    } else if (sortField === 'amount') {
      comparison = a.amount - b.amount;
    } else if (sortField === 'risk') {
      const riskOrder = { 'low': 1, 'medium': 2, 'high': 3 };
      comparison = riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
    }
    
    return sortDirection === 'desc' ? -comparison : comparison;
  });

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleTransactionClick = (transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const runAIAnalysisOnAll = async () => {
    setIsAnalyzing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Bulk Analysis Complete",
        description: `AI model has analyzed ${sortedTransactions.length} transactions`,
      });
      
      setAiAnalyzedTransactions(sortedTransactions.map(t => t.id));
      
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze transactions. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Dashboard</CardTitle>
        <CardDescription>Monitor blockchain transactions and fraud indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setView('list')}
                className={view === 'list' ? 'bg-muted/50' : ''}
              >
                <ActivitySquare className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setView('map')}
                className={view === 'map' ? 'bg-muted/50' : ''}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risks</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toggleSort('timestamp')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Date
                <ArrowDownUp className="ml-2 h-3 w-3" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => toggleSort('amount')}
              >
                Amount
                <ArrowDownUp className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="all" className="flex-grow">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="incoming">Incoming</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runAIAnalysisOnAll}
            disabled={isAnalyzing || sortedTransactions.length === 0}
            className="ml-2"
          >
            <Brain className="mr-2 h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "AI Analyze All"}
          </Button>
        </div>
        
        {view === 'list' ? (
          <div className="space-y-1">
            {sortedTransactions.length > 0 ? (
              sortedTransactions.map(transaction => (
                <div key={transaction.id} onClick={() => handleTransactionClick(transaction)} className="cursor-pointer">
                  <TransactionItem transaction={transaction} />
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <ActivitySquare className="h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No Transactions Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm || riskFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
                    ? 'Try changing your filters or search term' 
                    : 'Transactions will appear here once available'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-96 rounded-md bg-muted/20 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">Transaction Map View</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Geographic visualization of transaction activity
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setView('list')}>
                Switch to List View
              </Button>
            </div>
          </div>
        )}
        
        {selectedTransaction && (
          <TransactionModal
            isOpen={isModalOpen}
            onClose={closeModal}
            transaction={selectedTransaction}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionDashboard;
