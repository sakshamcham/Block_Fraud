
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChainType } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import WalletConnect from './WalletConnect';
import NotificationCenter from './NotificationCenter';
import { ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockNotifications } from '@/utils/mockData';
import { INotification } from '@/types';

interface AppHeaderProps {
  onWalletConnect: (address: string) => void;
  walletAddress: string;
  onChainChange: (chain: ChainType) => void;
  currentChain: ChainType;
}

const AppHeader = ({ onWalletConnect, walletAddress, onChainChange, currentChain }: AppHeaderProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<INotification[]>(mockNotifications);
  
  const handleChainChange = (value: string) => {
    const newChain = value as ChainType;
    onChainChange(newChain);
    
    toast({
      title: "Chain Updated",
      description: `Switched to ${newChain.charAt(0).toUpperCase() + newChain.slice(1)} network`,
    });
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast({
      title: "Notifications Cleared",
      description: "All notifications have been cleared",
    });
  };

  const handleDeleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <header className="py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 border-b border-border">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <ShieldCheck className="text-primary h-8 w-8 mr-2" />
          <h1 className="text-2xl font-bold text-gradient">BlockFraud</h1>
        </div>
        
        <Select value={currentChain} onValueChange={handleChainChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select Chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ethereum">Ethereum</SelectItem>
            <SelectItem value="polygon">Polygon</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationCenter 
          notifications={notifications} 
          onMarkAsRead={handleMarkAsRead}
          onClearAll={handleClearAll}
          onDeleteNotification={handleDeleteNotification}
        />
        <WalletConnect onConnect={onWalletConnect} address={walletAddress} />
      </div>
    </header>
  );
};

export default AppHeader;
