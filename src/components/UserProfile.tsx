
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IUser } from '@/types';
import { shortenAddress } from '@/utils/mockData';
import { Shield, Bell, Lock, ExternalLink, Info, Users, Key, Fingerprint, Settings } from 'lucide-react';

interface UserProfileProps {
  user: IUser;
  onUpdateUser: (user: IUser) => void;
}

const UserProfile = ({ user, onUpdateUser }: UserProfileProps) => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  
  // Risk score (mocked value)
  const riskScore = user.verificationStatus === 'verified' ? 92 : 65;
  
  const handleNotificationChange = (type: string, value: boolean) => {
    switch (type) {
      case 'email':
        setEmailNotifications(value);
        break;
      case 'push':
        setPushNotifications(value);
        break;
      case 'security':
        setSecurityAlerts(value);
        break;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Manage your account settings and preferences
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center md:items-start gap-4 md:min-w-[200px]">
            <Avatar className="h-28 w-28">
              <AvatarFallback className="text-2xl">
                {user.name ? user.name.charAt(0) : '?'}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left">
              <h3 className="text-xl font-medium">
                {user.name || 'Anonymous User'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-mono text-muted-foreground">
                  {shortenAddress(user.walletAddress)}
                </span>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="w-full flex flex-wrap gap-2 justify-center md:justify-start">
              <Badge variant="outline" className={
                user.verificationStatus === 'verified' 
                  ? 'bg-success/20 text-success' 
                  : user.verificationStatus === 'pending'
                  ? 'bg-warning/20 text-warning'
                  : 'bg-muted/50 text-muted-foreground'
              }>
                <Shield className="mr-1 h-3 w-3" />
                {user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}
              </Badge>
              
              <Badge variant="outline" className={
                user.zkpStatus === 'active'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted/50 text-muted-foreground'
              }>
                <Lock className="mr-1 h-3 w-3" />
                ZKP {user.zkpStatus.charAt(0).toUpperCase() + user.zkpStatus.slice(1)}
              </Badge>
            </div>
            
            <div className="w-full mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Risk Score</span>
                <span className={
                  riskScore > 80 
                    ? 'text-success' 
                    : riskScore > 60 
                    ? 'text-warning' 
                    : 'text-danger'
                }>
                  {riskScore}/100
                </span>
              </div>
              <Progress 
                value={riskScore} 
                className={`h-2 ${
                  riskScore > 80 
                    ? 'bg-success/20' 
                    : riskScore > 60 
                    ? 'bg-warning/20' 
                    : 'bg-danger/20'
                }`}
              />
            </div>
          </div>
          
          <div className="flex-1">
            <Tabs defaultValue="settings">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notification">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="settings" className="mt-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Account Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your account preferences and connected services
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Default Chain</h4>
                      <p className="text-sm text-muted-foreground">Select your preferred blockchain</p>
                    </div>
                    <Select defaultValue="ethereum">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select Chain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">High Risk Blocking</h4>
                      <p className="text-sm text-muted-foreground">Automatically block high-risk transactions</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Language</h4>
                      <p className="text-sm text-muted-foreground">Set your preferred language</p>
                    </div>
                    <Select defaultValue="en">
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="mt-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Security</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your security settings and connected devices
                  </p>
                </div>
                
                <Alert>
                  <Fingerprint className="h-4 w-4" />
                  <AlertTitle>2FA Recommended</AlertTitle>
                  <AlertDescription>
                    Enable two-factor authentication to add an extra layer of security to your account.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Require 2FA for high-value transactions</p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Connected Devices</h4>
                      <p className="text-sm text-muted-foreground">View and manage your connected devices</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Key className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 bg-muted/20 p-4 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Security Tips</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>Never share your private keys or recovery phrases with anyone.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>Always verify the contract address before approving transactions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>Be cautious of phishing attempts and only use official websites.</span>
                    </li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="notification" className="mt-4 space-y-4">
                <div className="space-y-1">
                  <h3 className="text-lg font-medium">Notification Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose how and when you want to be notified
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications in the browser</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={pushNotifications}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="security-alerts">Security Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified about security events</p>
                    </div>
                    <Switch
                      id="security-alerts"
                      checked={securityAlerts}
                      onCheckedChange={(checked) => handleNotificationChange('security', checked)}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserProfile;
