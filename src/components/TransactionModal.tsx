
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { formatDate, getRiskLevelColor, shortenAddress } from '@/utils/mockData';
import { ITransaction } from '@/types';
import { ExternalLink, Copy, AlertTriangle, CheckCircle, Clock, FileText, Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AIFraudDetection from './AIFraudDetection';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ITransaction;
}

const TransactionModal = ({ isOpen, onClose, transaction }: TransactionModalProps) => {
  const { toast } = useToast();
  
  const { 
    id, sender, receiver, amount, currency, status, riskLevel, 
    timestamp, blockConfirmations, blockHash 
  } = transaction;
  
  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-danger" />;
      default:
        return null;
    }
  };
  
  const getRiskDescription = () => {
    switch (riskLevel) {
      case 'low':
        return "This transaction appears to be legitimate with no suspicious patterns detected.";
      case 'medium':
        return "This transaction shows some unusual patterns. Additional verification is recommended.";
      case 'high':
        return "This transaction matches known fraud patterns. Proceed with extreme caution.";
      default:
        return "";
    }
  };
  
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: `${label} copied to clipboard`,
    });
  };
  
  const openBlockExplorer = () => {
    // Using Etherscan as an example, would need to change based on network
    const explorerUrl = `https://etherscan.io/tx/${id}`;
    window.open(explorerUrl, '_blank');
  };
  
  const reportTransaction = () => {
    toast({
      title: "Transaction Reported",
      description: "Your report has been submitted for investigation.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            Transaction ID: {shortenAddress(id)}
            <Button
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 ml-1"
              onClick={() => copyToClipboard(id, "Transaction ID")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-sm text-muted-foreground">
                {formatDate(timestamp)}
              </div>
              <div className={`font-medium text-2xl ${getRiskLevelColor(riskLevel)}`}>
                {amount} {currency}
              </div>
            </div>
            <Badge variant="outline" className={`
              ${status === 'confirmed' ? 'bg-success/20 text-success' : 
                status === 'rejected' ? 'bg-danger/20 text-danger' : 
                'bg-muted/50 text-muted-foreground'}
              px-3 py-1
            `}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{status}</span>
            </Badge>
          </div>
          
          {/* Add AI Fraud Detection Component */}
          <AIFraudDetection transaction={transaction} />
          
          <div className="bg-muted/20 rounded-lg p-4">
            <div className="flex flex-col gap-3">
              <div>
                <div className="text-sm text-muted-foreground mb-1">From</div>
                <div className="flex items-center">
                  <span className="font-mono">{sender}</span>
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(sender, "Sender address")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground mb-1">To</div>
                <div className="flex items-center">
                  <span className="font-mono">{receiver}</span>
                  <Button
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1"
                    onClick={() => copyToClipboard(receiver, "Receiver address")}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {blockHash && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Block Hash</div>
                  <div className="flex items-center">
                    <span className="font-mono text-xs break-all">{blockHash}</span>
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-1"
                      onClick={() => copyToClipboard(blockHash, "Block hash")}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {status !== 'rejected' && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Block Confirmations</span>
                <span>{blockConfirmations}/12</span>
              </div>
              <Progress value={(blockConfirmations / 12) * 100} className="h-2" />
            </div>
          )}
          
          <div className={`
            p-4 rounded-lg 
            ${riskLevel === 'low' ? 'bg-success/10 border border-success/20' : 
              riskLevel === 'medium' ? 'bg-warning/10 border border-warning/20' : 
              'bg-danger/10 border border-danger/20'}
          `}>
            <div className="flex items-start gap-2">
              {riskLevel === 'low' ? (
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
              ) : riskLevel === 'medium' ? (
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-danger mt-0.5" />
              )}
              <div>
                <div className={`font-medium ${getRiskLevelColor(riskLevel)}`}>
                  {riskLevel === 'low' ? 'Low Risk' : 
                    riskLevel === 'medium' ? 'Medium Risk' : 
                    'High Risk'}
                </div>
                <p className="text-sm mt-1">{getRiskDescription()}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              className="flex-1"
              variant="outline" 
              onClick={openBlockExplorer}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Explorer
            </Button>
            
            <Button
              className="flex-1"
              variant="outline"
              onClick={reportTransaction}
            >
              <Flag className="mr-2 h-4 w-4" />
              Report Transaction
            </Button>
            
            <Button
              className="flex-1"
              onClick={() => {
                toast({
                  title: "Dispute Filed",
                  description: "Your dispute has been submitted for review.",
                });
                onClose();
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              File Dispute
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionModal;
