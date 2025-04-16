
export interface IUser {
  id: string;
  name: string;
  walletAddress: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  zkpStatus: 'inactive' | 'active' | 'pending' | 'generating' | 'verified' | 'failed';
  verificationHash?: string;
  profileImage?: string;
  email?: string;
  securityLevel?: 'standard' | 'enhanced' | 'maximum';
  lastActivity?: number;
}

export interface ITransaction {
  id: string;
  timestamp: number;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  riskLevel: 'low' | 'medium' | 'high';
  blockConfirmations: number;
  blockHash?: string;
  location?: {
    sender?: string;
    receiver?: string;
  };
  metadata?: {
    category?: string;
    memo?: string;
    gasPrice?: number;
    gasLimit?: number;
  };
  aiDetection?: {
    fraudScore?: number;
    verdict?: 'legitimate' | 'suspicious' | 'fraudulent';
    confidence?: number;
    analysisTime?: number;
  };
}

export interface IDispute {
  id: string;
  transactionId: string;
  createdAt: number;
  status: 'open' | 'voting' | 'resolved';
  resolution?: 'approved' | 'rejected';
  votesFor: number;
  votesAgainst: number;
  evidence: IEvidence[];
  description?: string;
  timeline?: IDisputeEvent[];
}

export interface IDisputeEvent {
  id: string;
  disputeId: string;
  eventType: 'created' | 'evidence_added' | 'voting_started' | 'vote_cast' | 'resolved';
  timestamp: number;
  data?: any;
}

export interface IEvidence {
  id: string;
  disputeId: string;
  ipfsHash: string;
  description: string;
  uploadedAt: number;
  fileType?: string;
}

export interface INotification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  transactionId?: string;
  link?: string;
}

export type ChainType = 'ethereum' | 'polygon';

// API interfaces for backend integration
export interface ITransactionHistoryRequest {
  walletAddress?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
}

export interface ITransactionHistoryResponse {
  transactions: ITransaction[];
  total: number;
  hasMore: boolean;
}

export interface IAIAnalysisRequest {
  transactionId: string;
  transactionData: Partial<ITransaction>;
}

export interface IAIAnalysisResponse {
  transactionId: string;
  fraudScore: number;
  verdict: 'legitimate' | 'suspicious' | 'fraudulent';
  confidence: number;
  analysisTime: number;
  details?: {
    flaggedPatterns?: string[];
    similarCases?: number;
    recommendation?: string;
  };
}
