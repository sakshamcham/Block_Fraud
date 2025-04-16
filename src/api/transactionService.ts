
import { ITransaction, ITransactionHistoryRequest, ITransactionHistoryResponse, IAIAnalysisRequest, IAIAnalysisResponse } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Base API URL - would be replaced with an actual API endpoint in production
const API_URL = 'https://api.blockfraud.com';

/**
 * Get transaction history with filtering options
 */
export const getTransactionHistory = async (
  params: ITransactionHistoryRequest
): Promise<ITransactionHistoryResponse> => {
  try {
    const { walletAddress, startDate, endDate, limit = 20, offset = 0 } = params;
    
    // Build query
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (walletAddress) {
      query = query.or(`sender.eq.${walletAddress},receiver.eq.${walletAddress}`);
    }
    
    if (startDate) {
      query = query.gte('timestamp', new Date(startDate).toISOString());
    }
    
    if (endDate) {
      query = query.lte('timestamp', new Date(endDate).toISOString());
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1).order('timestamp', { ascending: false });
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // For demo, if we don't have real data, use mock data
    if (!data || data.length === 0) {
      // Import and use mock data
      const { mockTransactions } = await import('@/utils/mockData');
      return {
        transactions: mockTransactions.slice(0, limit),
        total: mockTransactions.length,
        hasMore: mockTransactions.length > limit
      };
    }
    
    // Map the database response to the ITransaction type
    const mappedTransactions: ITransaction[] = data.map(item => ({
      id: item.id,
      timestamp: new Date(item.timestamp).getTime(),
      sender: item.sender,
      receiver: item.receiver,
      amount: Number(item.amount), // Convert from decimal to number
      currency: item.currency,
      status: item.status as 'pending' | 'confirmed' | 'rejected',
      riskLevel: item.risk_level as 'low' | 'medium' | 'high',
      blockConfirmations: item.block_confirmations,
      blockHash: item.block_hash,
      location: item.location as { sender?: string; receiver?: string },
      metadata: item.metadata as { 
        category?: string; 
        memo?: string; 
        gasPrice?: number; 
        gasLimit?: number 
      }
    }));
    
    return {
      transactions: mappedTransactions,
      total: count || 0,
      hasMore: (count || 0) > offset + limit
    };
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    // Fallback to mock data
    const { mockTransactions } = await import('@/utils/mockData');
    return {
      transactions: mockTransactions.slice(0, params.limit || 20),
      total: mockTransactions.length,
      hasMore: mockTransactions.length > (params.limit || 20)
    };
  }
};

/**
 * Submit a transaction for AI analysis
 */
export const analyzeTransaction = async (
  data: IAIAnalysisRequest
): Promise<IAIAnalysisResponse> => {
  try {
    // Call the Supabase Edge Function for AI analysis
    const { data: response, error } = await supabase.functions.invoke('analyze-transaction', {
      body: { transaction: data.transactionData },
    });
    
    if (error) throw error;
    
    return {
      transactionId: data.transactionId,
      fraudScore: response.fraudScore,
      verdict: response.verdict,
      confidence: response.confidence,
      analysisTime: Date.now(),
      details: response.details
    };
  } catch (error) {
    console.error('Error analyzing transaction:', error);
    
    // Simulate AI model response based on transaction risk level as fallback
    let fraudScore = 0;
    let verdict: 'legitimate' | 'suspicious' | 'fraudulent' = 'legitimate';
    
    if (data.transactionData.riskLevel === 'low') {
      fraudScore = Math.floor(Math.random() * 30);
      verdict = 'legitimate';
    } else if (data.transactionData.riskLevel === 'medium') {
      fraudScore = 30 + Math.floor(Math.random() * 40);
      verdict = 'suspicious';
    } else {
      fraudScore = 70 + Math.floor(Math.random() * 30);
      verdict = 'fraudulent';
    }
    
    return {
      transactionId: data.transactionId,
      fraudScore,
      verdict,
      confidence: Math.floor(70 + Math.random() * 30),
      analysisTime: Date.now(),
      details: {
        flaggedPatterns: verdict !== 'legitimate' ? [
          'Unusual transaction amount',
          'Suspicious recipient history',
          'Pattern matches known fraud cases'
        ] : [],
        similarCases: verdict !== 'legitimate' ? Math.floor(Math.random() * 500) : 0,
        recommendation: verdict === 'fraudulent' 
          ? 'Block this transaction immediately'
          : verdict === 'suspicious'
          ? 'Review this transaction carefully before proceeding'
          : 'No action required'
      }
    };
  }
};

/**
 * Record a transaction in the blockchain
 */
export const recordTransaction = async (
  transaction: Partial<ITransaction>
): Promise<ITransaction> => {
  try {
    // Insert the transaction into the database
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        hash_id: transaction.id || Math.random().toString(36).substring(2, 15),
        sender: transaction.sender || '',
        receiver: transaction.receiver || '',
        amount: transaction.amount || 0,
        currency: transaction.currency || 'ETH',
        status: transaction.status || 'pending',
        risk_level: transaction.riskLevel || 'low',
        block_confirmations: transaction.blockConfirmations || 0,
        block_hash: transaction.blockHash,
        location: transaction.location as any,
        metadata: transaction.metadata as any
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Map the database response to the ITransaction type
    return {
      id: data.id,
      timestamp: new Date(data.timestamp).getTime(),
      sender: data.sender,
      receiver: data.receiver,
      amount: data.amount,
      currency: data.currency,
      status: data.status as 'pending' | 'confirmed' | 'rejected',
      riskLevel: data.risk_level as 'low' | 'medium' | 'high',
      blockConfirmations: data.block_confirmations,
      blockHash: data.block_hash,
      location: data.location as { sender?: string; receiver?: string },
      metadata: data.metadata as { 
        category?: string; 
        memo?: string; 
        gasPrice?: number; 
        gasLimit?: number 
      }
    };
  } catch (error) {
    console.error('Error recording transaction:', error);
    
    // Fallback to mock implementation
    const id = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    
    return {
      id,
      timestamp,
      sender: transaction.sender || '',
      receiver: transaction.receiver || '',
      amount: transaction.amount || 0,
      currency: transaction.currency || 'ETH',
      status: transaction.status || 'pending',
      riskLevel: transaction.riskLevel || 'low',
      blockConfirmations: transaction.blockConfirmations || 0,
      blockHash: transaction.blockHash,
      location: transaction.location,
      metadata: transaction.metadata
    } as ITransaction;
  }
};

/**
 * Submit feedback on AI fraud detection
 */
export const submitAIFeedback = async (
  transactionId: string,
  isCorrectVerdict: boolean,
  actualVerdict?: 'legitimate' | 'suspicious' | 'fraudulent'
): Promise<{ success: boolean }> => {
  try {
    // In a real implementation, this would send feedback to your AI model
    // and update the analysis in the database
    
    // For now, just log the feedback
    console.log('AI Feedback:', { transactionId, isCorrectVerdict, actualVerdict });
    
    return { success: true };
  } catch (error) {
    console.error('Error submitting AI feedback:', error);
    return { success: false };
  }
};
