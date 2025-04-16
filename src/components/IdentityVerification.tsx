"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ZKPStatus from '@/components/ZKPStatus';
import HashDisplay from '@/components/HashDisplay';
import { IUser } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { sha256 } from '@/utils/crypto';
import { generateZKProof } from '@/utils/zkProof';
import { Shield, Info, AlertTriangle, CheckCircle, Clock, Lock, FileText, Upload } from 'lucide-react';

interface IdentityVerificationProps {
  user: IUser;
  onUpdateUser: (updatedUser: IUser) => void;
}

const IdentityVerification = ({ user, onUpdateUser }: IdentityVerificationProps) => {
  const [name, setName] = useState(user.name || '');
  const [dob, setDob] = useState('');
  const [fileSelected, setFileSelected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [zkpProgress, setZkpProgress] = useState(0);
  const [zkpGenerating, setZkpGenerating] = useState(false);
  const [hashedData, setHashedData] = useState('');
  const [zkpStatus, setZkpStatus] = useState<'inactive' | 'generating' | 'verified' | 'failed' | 'pending'>(
    user.zkpStatus === 'active' ? 'verified' : 'inactive'
  );
  
  const { toast } = useToast();
  const totalSteps = 3;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(!!e.target.files && e.target.files.length > 0);
  };

  const hashUserData = async () => {
    if (!name || !dob) return '';
    const dataToHash = `${name}-${dob}-${user.walletAddress}-${Date.now()}`;
    const hashed = await sha256(dataToHash);
    setHashedData(hashed);
    return hashed;
  };

  const simulateZkpGeneration = async () => {
    if (!name || !dob) return;
    
    setZkpGenerating(true);
    setZkpStatus('generating');
    setZkpProgress(0);
    
    try {
      const interval = setInterval(() => {
        setZkpProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 95) {
            clearInterval(interval);
            return 95;
          }
          return newProgress;
        });
      }, 200);
      
      const userData = {
        name,
        dob,
        walletAddress: user.walletAddress,
        timestamp: Date.now()
      };
      
      const { hash } = await generateZKProof(userData);
      setHashedData(hash);
      
      clearInterval(interval);
      setZkpProgress(100);
      setZkpStatus('verified');
      setZkpGenerating(false);
      
      toast({
        title: "ZKP Generated",
        description: "Your zero-knowledge proof has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating ZKP:", error);
      setZkpStatus('failed');
      setZkpGenerating(false);
      
      toast({
        title: "Error Generating ZKP",
        description: "There was a problem generating your zero-knowledge proof. Please try again.",
        variant: "destructive",
      });
    }
  };

  const goToNextStep = async () => {
    if (currentStep === 1) {
      if (!name || !dob) {
        toast({
          title: "Missing Information",
          description: "Please fill out all personal details",
          variant: "destructive",
        });
        return;
      }
      
      await hashUserData();
    }
    
    if (currentStep === 2) {
      if (!fileSelected) {
        toast({
          title: "Missing Document",
          description: "Please upload your government ID",
          variant: "destructive",
        });
        return;
      }
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      
      if (currentStep === 2) {
        simulateZkpGeneration();
      }
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (zkpGenerating || !hashedData) {
      toast({
        title: "Processing in progress",
        description: "Please wait for ZKP generation to complete",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const updatedUser = {
      ...user,
      name,
      verificationStatus: 'verified' as const,
      verificationHash: hashedData,
      zkpStatus: 'active' as const
    };
    
    onUpdateUser(updatedUser);
    
    toast({
      title: "Verification Complete",
      description: "Your identity has been verified and ZKP has been activated",
    });
    
    setIsSubmitting(false);
  };

  const activateZKP = () => {
    if (user.verificationStatus !== 'verified') {
      toast({
        title: "Verification Required",
        description: "Please complete identity verification first",
        variant: "destructive",
      });
      return;
    }
    
    const updatedUser = {
      ...user,
      zkpStatus: 'active' as const,
    };
    
    onUpdateUser(updatedUser);
    
    toast({
      title: "ZKP Activated",
      description: "Zero-Knowledge Proof protocol is now active",
    });
  };

  const getVerificationStatusBadge = () => {
    switch (user.verificationStatus) {
      case 'unverified':
        return <Badge variant="outline" className="ml-2">Unverified</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-warning/20 text-warning ml-2">Pending</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-success/20 text-success ml-2">Verified</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-danger/20 text-danger ml-2">Rejected</Badge>;
      default:
        return null;
    }
  };

  const getZKPStatusBadge = () => {
    switch (user.zkpStatus) {
      case 'inactive':
        return <Badge variant="outline" className="ml-2">Inactive</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-secondary/30 text-secondary ml-2">Active</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Identity Verification</CardTitle>
          {getVerificationStatusBadge()}
        </div>
        <CardDescription>
          Verify your identity securely using zero-knowledge proofs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="verification">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="zkp">ZKP Status {getZKPStatusBadge()}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verification">
            {user.verificationStatus === 'verified' ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Shield className="h-16 w-16 text-success mb-4" />
                <h3 className="text-xl font-medium mb-2">Identity Verified</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Your identity has been verified successfully. You can now access all features.
                </p>
                
                {hashedData && (
                  <div className="bg-muted/20 rounded-lg p-4 mt-2 w-full">
                    <ZKPStatus 
                      status="verified" 
                      hash={hashedData}
                      hashLabel="Identity Proof" 
                      tooltipContent="This hash represents your verified identity on-chain without revealing personal data" 
                    />
                  </div>
                )}
              </div>
            ) : user.verificationStatus === 'rejected' ? (
              <div className="flex flex-col items-center justify-center py-6">
                <AlertTriangle className="h-16 w-16 text-danger mb-4" />
                <h3 className="text-xl font-medium mb-2">Verification Rejected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Your identity verification was rejected. Please ensure all provided information is accurate.
                </p>
                <Button onClick={() => setCurrentStep(1)}>Try Again</Button>
              </div>
            ) : user.verificationStatus === 'pending' ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-pulse">
                  <Shield className="h-16 w-16 text-warning mb-4" />
                </div>
                <h3 className="text-xl font-medium mb-2">Verification Pending</h3>
                <p className="text-muted-foreground text-center">
                  Your identity verification is being processed. This should be completed within minutes.
                </p>
                
                {hashedData && (
                  <div className="bg-muted/20 rounded-lg p-4 mt-4 w-full">
                    <ZKPStatus 
                      status="pending" 
                      hash={hashedData}
                      hashLabel="Verification Hash" 
                      tooltipContent="This hash represents your identity submission" 
                    />
                  </div>
                )}
                
                <Progress value={70} className="w-full max-w-md mt-6" />
                <p className="text-xs text-muted-foreground mt-2">Verification in progress...</p>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    {Array.from({ length: totalSteps }).map((_, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium
                            ${index + 1 < currentStep ? 'bg-success text-success-foreground' : 
                              index + 1 === currentStep ? 'bg-primary text-primary-foreground' : 
                              'bg-muted text-muted-foreground'}`}
                        >
                          {index + 1 < currentStep ? <CheckCircle className="h-4 w-4" /> : index + 1}
                        </div>
                        <span className="text-xs mt-1">
                          {index === 0 ? 'Personal Info' : index === 1 ? 'Documents' : 'Verification'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="relative mt-2">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-muted rounded-full">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {currentStep === 1 && (
                  <div className="space-y-4 py-4">
                    <Alert className="mb-4">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Privacy Protected</AlertTitle>
                      <AlertDescription>
                        Your data will be hashed locally before submission. No personal information leaves your device.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input
                        id="dob"
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button onClick={goToNextStep}>
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Label htmlFor="govId">Government ID</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="ml-2 h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-80">Your ID will be processed securely using zero-knowledge proofs, allowing validation without exposing personal data.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex items-center justify-center w-full">
                        <label htmlFor="govId" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/20 border-muted hover:bg-muted/30">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Passport, Driver's License, or ID Card
                            </p>
                          </div>
                          <Input 
                            id="govId" 
                            type="file" 
                            className="hidden" 
                            onChange={handleFileChange} 
                          />
                        </label>
                      </div>
                      {fileSelected && (
                        <div className="flex items-center mt-2">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">File selected</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" onClick={goToPrevStep}>
                        Back
                      </Button>
                      <Button onClick={goToNextStep}>
                        Next Step
                      </Button>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-4 py-4">
                    <div className="bg-muted/20 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Lock className="h-5 w-5 mr-2 text-primary" />
                        <h3 className="font-medium">Zero-Knowledge Proof Generation</h3>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        Creating a cryptographic proof that verifies your identity without revealing private information.
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{Math.round(zkpProgress)}%</span>
                        </div>
                        <Progress value={zkpProgress} className="h-2" />
                      </div>
                      
                      {zkpGenerating ? (
                        <p className="text-xs text-muted-foreground mt-2">
                          Generating ZKP, please don't close this window...
                        </p>
                      ) : zkpProgress === 100 ? (
                        <p className="text-xs text-success mt-2">
                          ZKP generated successfully!
                        </p>
                      ) : null}
                    </div>
                    
                    {hashedData && (
                      <div className="bg-muted/10 p-4 rounded-lg">
                        <div className="mb-2">
                          <ZKPStatus 
                            status={zkpStatus} 
                            hash={hashedData}
                            hashLabel="Identity Hash" 
                            tooltipContent="This zero-knowledge proof allows verification of your identity without revealing your personal data" 
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          This is the secure hash of your identity data that will be stored on-chain.
                        </p>
                      </div>
                    )}

                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" onClick={goToPrevStep}>
                        Back
                      </Button>
                      <Button 
                        onClick={handleSubmit} 
                        disabled={zkpGenerating || isSubmitting || zkpProgress < 100}
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Verification'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="zkp">
            <div className="py-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Zero-Knowledge Proof Protocol</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  ZKP allows you to verify your identity without exposing personal data. Enable this feature for enhanced privacy.
                </p>
                
                <div className="p-4 bg-muted/20 rounded-lg mb-4">
                  <h4 className="font-medium mb-2">ZKP Benefits:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Enhanced privacy protection</li>
                    <li>Secure identity verification</li>
                    <li>Reduced risk of data exposure</li>
                    <li>Tamper-proof verification status</li>
                  </ul>
                </div>

                {hashedData && user.verificationStatus === 'verified' && (
                  <div className="bg-muted/10 p-4 rounded-lg mb-4">
                    <ZKPStatus 
                      status={user.zkpStatus === 'active' ? 'verified' : 'inactive'}
                      hash={hashedData}
                      hashLabel="Identity Proof" 
                      tooltipContent="This hash represents your verified identity on-chain" 
                    />
                  </div>
                )}

                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertTitle>How ZKP Works</AlertTitle>
                  <AlertDescription>
                    Zero-Knowledge Proofs allow one party to prove to another that a statement is true without revealing any additional information beyond the validity of the statement itself.
                  </AlertDescription>
                </Alert>
              </div>
              
              <Button
                onClick={activateZKP}
                className="w-full"
                variant={user.zkpStatus === 'active' ? "secondary" : "default"}
                disabled={user.verificationStatus !== 'verified' || user.zkpStatus === 'active'}
              >
                {user.zkpStatus === 'active' ? 'ZKP Activated' : 'Activate ZKP'}
              </Button>
              
              {user.verificationStatus !== 'verified' && (
                <p className="text-sm text-muted-foreground text-center mt-2">
                  Complete identity verification to enable ZKP.
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default IdentityVerification;
