
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { IDispute } from '@/types';
import { formatDate } from '@/utils/mockData';
import { Textarea } from '@/components/ui/textarea';
import { FileUp, GavelIcon, HistoryIcon, Upload, VoteIcon } from 'lucide-react';

interface DisputeResolutionProps {
  disputes: IDispute[];
}

const DisputeResolution = ({ disputes }: DisputeResolutionProps) => {
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(!!e.target.files && e.target.files.length > 0);
  };

  const handleEvidenceSubmit = (disputeId: string) => {
    if (!fileSelected || !evidenceDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a file and provide a description",
        variant: "destructive",
      });
      return;
    }

    // Simulate IPFS upload
    toast({
      title: "Uploading to IPFS",
      description: "Your evidence is being uploaded...",
    });

    setTimeout(() => {
      toast({
        title: "Evidence Submitted",
        description: "Your evidence has been uploaded to IPFS and added to the dispute",
      });
      
      setEvidenceDescription('');
      setFileSelected(false);
    }, 2000);
  };

  const getStatusBadge = (status: IDispute['status'], resolution?: IDispute['resolution']) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="ml-2">Open</Badge>;
      case 'voting':
        return <Badge variant="outline" className="bg-warning/20 text-warning ml-2">Voting</Badge>;
      case 'resolved':
        return (
          <Badge 
            variant="outline" 
            className={`ml-2 ${resolution === 'approved' ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'}`}
          >
            {resolution === 'approved' ? 'Approved' : 'Rejected'}
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispute Resolution</CardTitle>
        <CardDescription>Challenge fraud flags through decentralized voting</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="disputes">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="disputes">Active Disputes</TabsTrigger>
            <TabsTrigger value="history">Dispute History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="disputes">
            <div className="py-2 space-y-4">
              {disputes.filter(d => d.status !== 'resolved').length > 0 ? (
                disputes
                  .filter(d => d.status !== 'resolved')
                  .map(dispute => (
                    <Card key={dispute.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">Transaction Dispute #{dispute.transactionId}</h3>
                            {getStatusBadge(dispute.status)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {formatDate(dispute.createdAt)}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveDisputeId(activeDisputeId === dispute.id ? null : dispute.id)}
                        >
                          {activeDisputeId === dispute.id ? 'Close' : 'View'}
                        </Button>
                      </div>
                      
                      {activeDisputeId === dispute.id && (
                        <div className="space-y-4">
                          {dispute.status === 'voting' && (
                            <div className="bg-muted/20 p-3 rounded-md">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <VoteIcon className="h-4 w-4 mr-2" />
                                  <span className="text-sm font-medium">DAO Voting Status</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {Math.round((dispute.votesFor / (dispute.votesFor + dispute.votesAgainst)) * 100)}% Support
                                </Badge>
                              </div>
                              <div className="flex gap-4 text-center mt-3">
                                <div className="flex-1">
                                  <div className="text-md font-medium text-success">{dispute.votesFor}</div>
                                  <div className="text-xs text-muted-foreground">Votes For</div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-md font-medium text-danger">{dispute.votesAgainst}</div>
                                  <div className="text-xs text-muted-foreground">Votes Against</div>
                                </div>
                                <div className="flex-1">
                                  <div className="text-md font-medium">{dispute.votesFor + dispute.votesAgainst}</div>
                                  <div className="text-xs text-muted-foreground">Total Votes</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Evidence Submitted ({dispute.evidence.length})</h4>
                            {dispute.evidence.length > 0 ? (
                              <div className="space-y-2">
                                {dispute.evidence.map(evidence => (
                                  <div key={evidence.id} className="bg-card p-3 rounded-md border border-border">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-sm font-medium truncate">{evidence.description}</span>
                                      <span className="text-xs text-muted-foreground">{formatDate(evidence.uploadedAt)}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <FileUp className="h-3 w-3 mr-1 text-muted-foreground" />
                                      <a 
                                        href={`https://ipfs.io/ipfs/${evidence.ipfsHash}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-xs text-primary hover:underline truncate"
                                      >
                                        {evidence.ipfsHash}
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No evidence has been submitted yet.</p>
                            )}
                          </div>
                          
                          <div className="space-y-3 mt-4">
                            <h4 className="text-sm font-medium">Submit New Evidence</h4>
                            <div className="flex items-center justify-center w-full">
                              <label htmlFor={`file-${dispute.id}`} className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 border-muted hover:bg-muted/30">
                                <div className="flex flex-col items-center justify-center pt-5 pb-4">
                                  <Upload className="w-6 h-6 mb-2 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    Click to upload or drag and drop
                                  </p>
                                </div>
                                <input 
                                  id={`file-${dispute.id}`} 
                                  type="file" 
                                  className="hidden" 
                                  onChange={handleFileChange} 
                                />
                              </label>
                            </div>
                            {fileSelected && (
                              <div className="flex items-center mt-2">
                                <FileUp className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">File selected for IPFS upload</span>
                              </div>
                            )}
                            
                            <Textarea 
                              placeholder="Describe your evidence..."
                              value={evidenceDescription}
                              onChange={(e) => setEvidenceDescription(e.target.value)}
                              className="h-20"
                            />
                            
                            <Button 
                              onClick={() => handleEvidenceSubmit(dispute.id)}
                              className="w-full"
                              disabled={!fileSelected || !evidenceDescription.trim()}
                            >
                              Submit to IPFS
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
              ) : (
                <div className="py-8 text-center">
                  <GavelIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No Active Disputes</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There are currently no active disputes to resolve
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="py-2 space-y-4">
              {disputes.filter(d => d.status === 'resolved').length > 0 ? (
                disputes
                  .filter(d => d.status === 'resolved')
                  .map(dispute => (
                    <Card key={dispute.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">Transaction Dispute #{dispute.transactionId}</h3>
                            {getStatusBadge(dispute.status, dispute.resolution)}
                          </div>
                          <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                            <span>Created: {formatDate(dispute.createdAt)}</span>
                            <span>Evidence: {dispute.evidence.length}</span>
                            <span>Votes: {dispute.votesFor + dispute.votesAgainst}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveDisputeId(activeDisputeId === dispute.id ? null : dispute.id)}
                        >
                          {activeDisputeId === dispute.id ? 'Close' : 'Details'}
                        </Button>
                      </div>
                      
                      {activeDisputeId === dispute.id && (
                        <div className="mt-4 space-y-3">
                          <div className="bg-muted/20 p-3 rounded-md">
                            <h4 className="text-sm font-medium mb-2">Voting Results</h4>
                            <div className="flex gap-4 text-center">
                              <div className="flex-1">
                                <div className="text-md font-medium text-success">{dispute.votesFor}</div>
                                <div className="text-xs text-muted-foreground">Votes For</div>
                              </div>
                              <div className="flex-1">
                                <div className="text-md font-medium text-danger">{dispute.votesAgainst}</div>
                                <div className="text-xs text-muted-foreground">Votes Against</div>
                              </div>
                              <div className="flex-1">
                                <div className="text-md font-medium">{Math.round((dispute.votesFor / (dispute.votesFor + dispute.votesAgainst)) * 100)}%</div>
                                <div className="text-xs text-muted-foreground">Support Rate</div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Evidence Submitted</h4>
                            <div className="space-y-2">
                              {dispute.evidence.map(evidence => (
                                <div key={evidence.id} className="bg-card p-3 rounded-md border border-border">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium truncate">{evidence.description}</span>
                                    <span className="text-xs text-muted-foreground">{formatDate(evidence.uploadedAt)}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <FileUp className="h-3 w-3 mr-1 text-muted-foreground" />
                                    <a 
                                      href={`https://ipfs.io/ipfs/${evidence.ipfsHash}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-primary hover:underline truncate"
                                    >
                                      {evidence.ipfsHash}
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))
              ) : (
                <div className="py-8 text-center">
                  <HistoryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <h3 className="text-lg font-medium">No Dispute History</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Resolved disputes will appear here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DisputeResolution;
