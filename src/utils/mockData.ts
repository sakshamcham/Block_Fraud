
import { ITransaction, IDispute, IUser, INotification } from '@/types';

// Mock user data
export const mockUser: IUser = {
  id: '1',
  name: '',
  walletAddress: '',
  verificationStatus: 'unverified',
  zkpStatus: 'inactive',
  lastActivity: Date.now() - 86400000 // 1 day ago
};

// Mock transaction data
export const mockTransactions: ITransaction[] = [
  {
    id: '1',
    timestamp: Date.now() - 300000, // 5 minutes ago
    sender: '0x1234...5678',
    receiver: '0xabcd...efgh',
    amount: 1.2,
    currency: 'ETH',
    status: 'confirmed',
    riskLevel: 'low',
    blockConfirmations: 12,
    blockHash: '0x7f1e74a478644f1b6c0de51536512bd87bc5a0731f3f59ce81c0f5d48799736d',
    location: {
      sender: 'New York, US',
      receiver: 'London, UK'
    },
    metadata: {
      category: 'payment',
      memo: 'Payment for services',
      gasPrice: 50,
      gasLimit: 21000
    }
  },
  {
    id: '2',
    timestamp: Date.now() - 600000, // 10 minutes ago
    sender: '0xabcd...efgh',
    receiver: '0x9876...5432',
    amount: 0.5,
    currency: 'ETH',
    status: 'confirmed',
    riskLevel: 'medium',
    blockConfirmations: 15,
    blockHash: '0x8d1e74a478644f1b6c0de51536512bd87bc5a0731f3f59ce81c0f5d48799736e',
    location: {
      sender: 'Tokyo, JP',
      receiver: 'Sydney, AU'
    },
    metadata: {
      category: 'exchange',
      memo: 'Token swap',
      gasPrice: 45,
      gasLimit: 21000
    }
  },
  {
    id: '3',
    timestamp: Date.now() - 60000, // 1 minute ago
    sender: '0x5678...1234',
    receiver: '0xefgh...abcd',
    amount: 3.0,
    currency: 'ETH',
    status: 'pending',
    riskLevel: 'high',
    blockConfirmations: 2,
    location: {
      sender: 'Unknown',
      receiver: 'Berlin, DE'
    },
    metadata: {
      category: 'unknown',
      gasPrice: 60,
      gasLimit: 21000
    }
  },
  {
    id: '4',
    timestamp: Date.now() - 7200000, // 2 hours ago
    sender: '0x1234...5678',
    receiver: '0x5432...9876',
    amount: 100.0,
    currency: 'MATIC',
    status: 'confirmed',
    riskLevel: 'low',
    blockConfirmations: 85,
    blockHash: '0x9f1e74a478644f1b6c0de51536512bd87bc5a0731f3f59ce81c0f5d48799736f',
    location: {
      sender: 'San Francisco, US',
      receiver: 'Singapore, SG'
    },
    metadata: {
      category: 'investment',
      memo: 'Portfolio allocation',
      gasPrice: 40,
      gasLimit: 21000
    }
  },
  {
    id: '5',
    timestamp: Date.now() - 3600000, // 1 hour ago
    sender: '0xefgh...abcd',
    receiver: '0x1234...5678',
    amount: 0.25,
    currency: 'ETH',
    status: 'rejected',
    riskLevel: 'high',
    blockConfirmations: 0,
    location: {
      sender: 'Moscow, RU',
      receiver: 'Miami, US'
    },
    metadata: {
      category: 'unknown',
      gasPrice: 55,
      gasLimit: 21000
    }
  }
];

// Mock dispute data
export const mockDisputes: IDispute[] = [
  {
    id: '1',
    transactionId: '5',
    createdAt: Date.now() - 1800000, // 30 minutes ago
    status: 'voting',
    votesFor: 7,
    votesAgainst: 3,
    description: 'This transaction was unauthorized and appears to be fraudulent. The sender address has been linked to multiple scam reports.',
    evidence: [
      {
        id: '1',
        disputeId: '1',
        ipfsHash: 'QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
        description: 'Transaction receipt showing legitimate purpose',
        uploadedAt: Date.now() - 1700000 // 28 minutes ago
      }
    ],
    timeline: [
      {
        id: '1',
        disputeId: '1',
        eventType: 'created',
        timestamp: Date.now() - 1800000,
      },
      {
        id: '2',
        disputeId: '1',
        eventType: 'evidence_added',
        timestamp: Date.now() - 1700000,
        data: { evidenceId: '1' }
      },
      {
        id: '3',
        disputeId: '1',
        eventType: 'voting_started',
        timestamp: Date.now() - 1600000,
      }
    ]
  },
  {
    id: '2',
    transactionId: '3',
    createdAt: Date.now() - 3600000, // 1 hour ago
    status: 'open',
    votesFor: 0,
    votesAgainst: 0,
    description: 'This transaction appears to be part of a wash trading scheme. The pattern of trading matches known market manipulation tactics.',
    evidence: [],
    timeline: [
      {
        id: '4',
        disputeId: '2',
        eventType: 'created',
        timestamp: Date.now() - 3600000,
      }
    ]
  },
  {
    id: '3',
    transactionId: '2',
    createdAt: Date.now() - 86400000, // 1 day ago
    status: 'resolved',
    resolution: 'approved',
    votesFor: 12,
    votesAgainst: 5,
    description: 'Transaction involved stolen funds from a previous hack. The receiver address has been blacklisted by multiple exchanges.',
    evidence: [
      {
        id: '2',
        disputeId: '3',
        ipfsHash: 'QmX2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
        description: 'Supporting documentation',
        uploadedAt: Date.now() - 85000000 // 23.6 hours ago
      },
      {
        id: '3',
        disputeId: '3',
        ipfsHash: 'QmZ2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ',
        description: 'Additional evidence',
        uploadedAt: Date.now() - 80000000 // 22.2 hours ago
      }
    ],
    timeline: [
      {
        id: '5',
        disputeId: '3',
        eventType: 'created',
        timestamp: Date.now() - 86400000,
      },
      {
        id: '6',
        disputeId: '3',
        eventType: 'evidence_added',
        timestamp: Date.now() - 85000000,
        data: { evidenceId: '2' }
      },
      {
        id: '7',
        disputeId: '3',
        eventType: 'evidence_added',
        timestamp: Date.now() - 80000000,
        data: { evidenceId: '3' }
      },
      {
        id: '8',
        disputeId: '3',
        eventType: 'voting_started',
        timestamp: Date.now() - 79000000,
      },
      {
        id: '9',
        disputeId: '3',
        eventType: 'resolved',
        timestamp: Date.now() - 50000000,
        data: { resolution: 'approved' }
      }
    ]
  }
];

// Mock notifications
export const mockNotifications: INotification[] = [
  {
    id: '1',
    type: 'danger',
    title: 'High Risk Transaction Detected',
    message: 'A transaction of 3.0 ETH has been flagged as high risk.',
    timestamp: Date.now() - 60000, // 1 minute ago
    read: false,
    transactionId: '3'
  },
  {
    id: '2',
    type: 'warning',
    title: 'New Dispute Filed',
    message: 'A new dispute has been filed for transaction #5.',
    timestamp: Date.now() - 1800000, // 30 minutes ago
    read: false,
    transactionId: '5'
  },
  {
    id: '3',
    type: 'success',
    title: 'Transaction Confirmed',
    message: 'Your transaction of 1.2 ETH has been confirmed.',
    timestamp: Date.now() - 300000, // 5 minutes ago
    read: true,
    transactionId: '1'
  },
  {
    id: '4',
    type: 'info',
    title: 'Wallet Connected',
    message: 'Your wallet has been successfully connected.',
    timestamp: Date.now() - 86400000, // 1 day ago
    read: true
  },
  {
    id: '5',
    type: 'warning',
    title: 'Medium Risk Transaction',
    message: 'A transaction of 0.5 ETH has been flagged as medium risk.',
    timestamp: Date.now() - 600000, // 10 minutes ago
    read: false,
    transactionId: '2'
  }
];

export const getRiskLevelColor = (riskLevel: 'low' | 'medium' | 'high'): string => {
  switch (riskLevel) {
    case 'low':
      return 'text-success';
    case 'medium':
      return 'text-warning';
    case 'high':
      return 'text-danger';
    default:
      return 'text-foreground';
  }
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString();
};

export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return address.length > 10 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address;
};
