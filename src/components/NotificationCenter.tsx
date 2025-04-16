
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { INotification } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NotificationCenterProps {
  notifications: INotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationCenter = ({ 
  notifications, 
  onMarkAsRead, 
  onClearAll,
  onDeleteNotification 
}: NotificationCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-4 w-4 text-primary" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'danger':
        return <AlertTriangle className="h-4 w-4 text-danger" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      default:
        return <Info className="h-4 w-4 text-primary" />;
    }
  };
  
  const alertNotifications = notifications.filter(n => n.type === 'warning' || n.type === 'danger');
  const infoNotifications = notifications.filter(n => n.type === 'info' || n.type === 'success');

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearAll}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="alerts">Alerts {alertNotifications.length > 0 && `(${alertNotifications.length})`}</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="m-0">
            {notifications.length > 0 ? (
              <ScrollArea className="h-80">
                <div className="p-1">
                  {notifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDeleteNotification={onDeleteNotification}
                    />
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No notifications</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="alerts" className="m-0">
            <ScrollArea className="h-80">
              <div className="p-1">
                {alertNotifications.length > 0 ? (
                  alertNotifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDeleteNotification={onDeleteNotification}
                    />
                  ))
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No alerts</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="info" className="m-0">
            <ScrollArea className="h-80">
              <div className="p-1">
                {infoNotifications.length > 0 ? (
                  infoNotifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onDeleteNotification={onDeleteNotification}
                    />
                  ))
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center">
                    <Info className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No information updates</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
};

interface NotificationItemProps {
  notification: INotification;
  onMarkAsRead: (id: string) => void;
  onDeleteNotification: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead, onDeleteNotification }: NotificationItemProps) => {
  const { id, title, message, type, timestamp, read } = notification;
  
  return (
    <Card className={`p-3 mb-1 ${!read ? 'bg-muted/30' : ''} hover:bg-muted/10`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getTypeIcon(type)}</div>
        <div className="flex-grow">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${!read ? 'text-foreground' : 'text-muted-foreground'}`}>{title}</h4>
            <div className="flex items-center">
              {!read && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => onMarkAsRead(id)}
                >
                  <Check className="h-3 w-3" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 ml-1" 
                onClick={() => onDeleteNotification(id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <p className={`text-xs ${!read ? 'text-foreground' : 'text-muted-foreground'}`}>{message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
      </div>
    </Card>
  );
};

// Helper function for notification type icon
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'info':
      return <Info className="h-4 w-4 text-primary" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-warning" />;
    case 'danger':
      return <AlertTriangle className="h-4 w-4 text-danger" />;
    case 'success':
      return <CheckCircle className="h-4 w-4 text-success" />;
    default:
      return <Info className="h-4 w-4 text-primary" />;
  }
};

export default NotificationCenter;
