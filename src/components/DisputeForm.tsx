
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { shortenAddress } from '@/utils/mockData';
import { ITransaction } from '@/types';
import { UploadCloud, FileText, Info, Database, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DisputeFormProps {
  transactions: ITransaction[];
  onSubmitDispute: (disputeData: any) => void;
}

const DisputeForm = ({ transactions, onSubmitDispute }: DisputeFormProps) => {
  const [selectedTransactionId, setSelectedTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ipfsHash, setIpfsHash] = useState('');
  const { toast } = useToast();

  const selectedTransaction = transactions.find(t => t.id === selectedTransactionId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileSelected(true);
      setFileName(file.name);
      setFileType(file.type);
    }
  };

  const handleUpload = () => {
    if (!fileSelected) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    // Simulate file upload to IPFS
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Generate fake IPFS hash
          const hash = `Qm${Math.random().toString(36).substring(2, 15)}`;
          setIpfsHash(hash);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTransactionId) {
      toast({
        title: "Missing Information",
        description: "Please select a transaction to dispute",
        variant: "destructive",
      });
      return;
    }
    
    if (!description) {
      toast({
        title: "Missing Information",
        description: "Please provide a description for the dispute",
        variant: "destructive",
      });
      return;
    }
    
    if (!ipfsHash) {
      toast({
        title: "Missing Evidence",
        description: "Please upload supporting evidence",
        variant: "destructive",
      });
      return;
    }
    
    const disputeData = {
      transactionId: selectedTransactionId,
      description,
      evidence: [{
        ipfsHash,
        description: fileName,
        fileType,
        uploadedAt: Date.now()
      }],
      createdAt: Date.now(),
      status: 'open'
    };
    
    onSubmitDispute(disputeData);
    
    toast({
      title: "Dispute Submitted",
      description: "Your dispute has been recorded and will be reviewed",
    });
    
    // Reset form
    setSelectedTransactionId('');
    setDescription('');
    setFileSelected(false);
    setFileName('');
    setFileType('');
    setIpfsHash('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>File a Dispute</CardTitle>
        <CardDescription>
          Provide details about the transaction you wish to dispute
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="transaction">Transaction</Label>
            <Select value={selectedTransactionId} onValueChange={setSelectedTransactionId}>
              <SelectTrigger id="transaction">
                <SelectValue placeholder="Select transaction to dispute" />
              </SelectTrigger>
              <SelectContent>
                {transactions.map(transaction => (
                  <SelectItem key={transaction.id} value={transaction.id}>
                    {shortenAddress(transaction.id)} - {transaction.amount} {transaction.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedTransaction && (
            <Alert className="bg-muted/20">
              <Database className="h-4 w-4" />
              <AlertTitle>Transaction Details</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-1 text-sm mt-2">
                  <div>Amount:</div>
                  <div className="font-medium">{selectedTransaction.amount} {selectedTransaction.currency}</div>
                  <div>From:</div>
                  <div className="font-medium">{shortenAddress(selectedTransaction.sender)}</div>
                  <div>To:</div>
                  <div className="font-medium">{shortenAddress(selectedTransaction.receiver)}</div>
                  <div>Status:</div>
                  <div className="font-medium capitalize">{selectedTransaction.status}</div>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description">Dispute Description</Label>
            <Textarea
              id="description"
              placeholder="Explain why you are disputing this transaction..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Supporting Evidence</Label>
            <div className="border-2 border-dashed rounded-md p-6">
              <div className="flex flex-col items-center">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">Upload Evidence</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 mb-4">
                  Drag and drop files here or click to browse
                </p>
                <Input 
                  id="file" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('file')?.click()}
                  disabled={uploading}
                >
                  Select File
                </Button>
                
                {fileSelected && !ipfsHash && (
                  <div className="mt-4 w-full">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                      <span className="text-sm">{fileName}</span>
                    </div>
                    {uploading ? (
                      <div className="w-full mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Uploading to IPFS...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-1" />
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={handleUpload}
                      >
                        Upload to IPFS
                      </Button>
                    )}
                  </div>
                )}
                
                {ipfsHash && (
                  <div className="mt-4 w-full p-3 bg-muted/20 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-primary mr-2" />
                          <span className="text-sm font-medium">{fileName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Stored on IPFS with hash:
                        </div>
                        <div className="text-xs font-mono mt-1 break-all">
                          {ipfsHash}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => window.open(`https://ipfs.io/ipfs/${ipfsHash}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Files are stored on IPFS (InterPlanetary File System) for permanent decentralized storage.
            </p>
          </div>
          
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              Your dispute will be reviewed by the DAO through a community voting process. False disputes may result in penalties.
            </AlertDescription>
          </Alert>
          
          <Button type="submit" className="w-full">
            Submit Dispute
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DisputeForm;
