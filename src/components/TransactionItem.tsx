import { ITransaction } from '@/types';
import { formatDate, getRiskLevelColor, shortenAddress } from '@/utils/mockData';
import { AlertCircle, AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HashDisplay from '@/components/HashDisplay';

interface TransactionItemProps {
  transaction: ITransaction;
}

const TransactionItem = ({ transaction }: TransactionItemProps) => {
  const {
    id,
    timestamp,
    sender,
    receiver,
    amount,
    currency,
    status,
    riskLevel,
    blockConfirmations
  } = transaction;

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'low':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-muted/50 text-muted-foreground"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="bg-success/20 text-success"><CheckCircle className="h-3 w-3 mr-1" /> Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/20 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      default:
        return null;
    }
  };

  const getConfirmationDisplay = () => {
    const percentage = Math.min(100, (blockConfirmations / 12) * 100);
    
    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Block Confirmations</span>
          <span>{blockConfirmations}/12</span>
        </div>
        <Progress value={percentage} className="h-1" />
      </div>
    );
  };

  return (
    <Card className="p-4 mb-3 hover:bg-muted/10 transition-all duration-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="space-y-2 w-full">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-medium text-lg ${getRiskLevelColor(riskLevel)}`}>{amount} {currency}</span>
            {getRiskIcon()}
            {getStatusBadge()}
            {riskLevel === 'high' && <span className="animate-pulse text-xs text-danger">Flagged</span>}
          </div>
          
          <div className="text-xs text-muted-foreground mb-1">
            <span>{formatDate(timestamp)}</span> • <HashDisplay hash={id} label="TX" tooltipContent="Transaction ID hash" />
          </div>
          
          <div className="text-sm flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">From:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-mono text-xs">{shortenAddress(sender)}</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-mono text-xs">
                    {sender}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <span className="hidden sm:inline mx-1">→</span>
            
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">To:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="font-mono text-xs">{shortenAddress(receiver)}</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="font-mono text-xs">
                    {receiver}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
              </TooltipTrigger>
              <TooltipContent side="left">
                View on blockchain explorer
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {status !== 'rejected' && getConfirmationDisplay()}
    </Card>
  );
};

export default TransactionItem;
