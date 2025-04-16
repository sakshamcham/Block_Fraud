
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wallet } from 'lucide-react';
import { shortenAddress } from '@/utils/mockData';
import { useToast } from '@/components/ui/use-toast';

interface WalletConnectProps {
  onConnect: (address: string) => void;
  address: string;
}

const WalletConnect = ({ onConnect, address }: WalletConnectProps) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (address) return;
    
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        
        onConnect(userAddress);
        toast({
          title: "Wallet Connected",
          description: `Connected to ${shortenAddress(userAddress)}`,
        });
      } else {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to connect your wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast({
        title: "Connection Error",
        description: "Could not connect to wallet",
        variant: "destructive",
      });
    }
    
    setIsConnecting(false);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={handleConnect} 
            variant={address ? "outline" : "default"}
            className={`rounded-full transition-all duration-300 ${address ? 'bg-muted hover:bg-muted/80' : ''}`}
            disabled={isConnecting}
          >
            <Wallet className="mr-2 h-4 w-4" />
            {address ? shortenAddress(address) : 'Connect Wallet'}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {address ? 'Connected Wallet' : 'Connect to MetaMask'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default WalletConnect;
