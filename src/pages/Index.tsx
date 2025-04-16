
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChainType, IUser, IDispute } from '@/types';
import { mockUser, mockTransactions, mockDisputes } from '@/utils/mockData';
import IdentityVerification from '@/components/IdentityVerification';
import TransactionDashboard from '@/components/TransactionDashboard';
import DisputeResolution from '@/components/DisputeResolution';
import DisputeForm from '@/components/DisputeForm';
import UserProfile from '@/components/UserProfile';
import AppHeader from '@/components/AppHeader';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [user, setUser] = useState<IUser>(mockUser);
  const [currentChain, setCurrentChain] = useState<ChainType>('ethereum');
  const [disputes, setDisputes] = useState<IDispute[]>(mockDisputes);
  const { toast } = useToast();
  
  const handleWalletConnect = (address: string) => {
    setUser({
      ...user,
      walletAddress: address
    });
    
    toast({
      title: "Wallet Connected",
      description: `Successfully connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
    });
  };
  
  const handleSubmitDispute = (disputeData: any) => {
    const newDispute: IDispute = {
      id: `${disputes.length + 1}`,
      transactionId: disputeData.transactionId,
      createdAt: disputeData.createdAt,
      status: 'open',
      votesFor: 0,
      votesAgainst: 0,
      evidence: disputeData.evidence,
      description: disputeData.description,
      timeline: [
        {
          id: `timeline-${disputes.length + 1}-1`,
          disputeId: `${disputes.length + 1}`,
          eventType: 'created',
          timestamp: Date.now()
        }
      ]
    };
    
    setDisputes([newDispute, ...disputes]);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader 
        onWalletConnect={handleWalletConnect}
        walletAddress={user.walletAddress}
        onChainChange={setCurrentChain}
        currentChain={currentChain}
      />
      
      <main className="container mx-auto px-4 pb-12 flex-grow">
        <Tabs defaultValue="identity" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="identity">Identity Verification</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Dashboard</TabsTrigger>
            <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
            <TabsTrigger value="file-dispute">File Dispute</TabsTrigger>
            <TabsTrigger value="profile">User Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="identity">
            <IdentityVerification 
              user={user}
              onUpdateUser={setUser}
            />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionDashboard transactions={mockTransactions} />
          </TabsContent>
          
          <TabsContent value="disputes">
            <DisputeResolution disputes={disputes} />
          </TabsContent>
          
          <TabsContent value="file-dispute">
            <DisputeForm 
              transactions={mockTransactions}
              onSubmitDispute={handleSubmitDispute}
            />
          </TabsContent>
          
          <TabsContent value="profile">
            <UserProfile 
              user={user}
              onUpdateUser={setUser}
            />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="py-4 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>Blockchain Fraud Detection System - BlockFraud © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default Index;
