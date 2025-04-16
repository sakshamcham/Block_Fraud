
import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, FileText, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ITransaction } from '@/types';
import { analyzeTransaction, submitAIFeedback } from '@/api/transactionService';

interface AIFraudDetectionProps {
  transaction: ITransaction;
}

const AIFraudDetection = ({ transaction }: AIFraudDetectionProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fraudScore, setFraudScore] = useState<number | null>(null);
  const [aiVerdict, setAiVerdict] = useState<'legitimate' | 'suspicious' | 'fraudulent' | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [details, setDetails] = useState<any>(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const { toast } = useToast();

  // Check if there's any existing analysis for this transaction stored in the component
  useEffect(() => {
    if (transaction.aiDetection) {
      setFraudScore(transaction.aiDetection.fraudScore || null);
      setAiVerdict(transaction.aiDetection.verdict || null);
      setConfidence(transaction.aiDetection.confidence || null);
    }
  }, [transaction]);

  const analyzeTransactionHandler = async () => {
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeTransaction({
        transactionId: transaction.id,
        transactionData: transaction
      });
      
      setFraudScore(result.fraudScore);
      setAiVerdict(result.verdict);
      setConfidence(result.confidence);
      setDetails(result.details);
      
      toast({
        title: "Analysis Complete",
        description: `AI model has analyzed the transaction with a fraud score of ${result.fraudScore}%`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze transaction. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sendFeedback = async (isCorrect: boolean) => {
    try {
      await submitAIFeedback(transaction.id, isCorrect);
      
      toast({
        title: "Feedback Sent",
        description: `Thank you for your feedback. This helps improve our AI model.`,
      });
      setFeedbackSent(true);
    } catch (error) {
      toast({
        title: "Failed to Send Feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const getScoreColor = () => {
    if (fraudScore === null) return "text-muted-foreground";
    if (fraudScore < 30) return "text-success";
    if (fraudScore < 70) return "text-warning";
    return "text-destructive";
  };

  const getVerdictBadge = () => {
    if (!aiVerdict) return null;
    
    switch (aiVerdict) {
      case 'legitimate':
        return <Badge variant="outline" className="bg-success/20 text-success"><Shield className="h-3 w-3 mr-1" /> Legitimate</Badge>;
      case 'suspicious':
        return <Badge variant="outline" className="bg-warning/20 text-warning"><AlertTriangle className="h-3 w-3 mr-1" /> Suspicious</Badge>;
      case 'fraudulent':
        return <Badge variant="outline" className="bg-destructive/20 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Fraudulent</Badge>;
      default:
        return null;
    }
  };

  const getAnalysisDetails = () => {
    if (!details) return null;
    
    return (
      <div className="mt-3 text-sm space-y-2">
        {details.flaggedPatterns && details.flaggedPatterns.length > 0 && (
          <div>
            <div className="font-medium">Flagged Patterns:</div>
            <ul className="list-disc pl-5">
              {details.flaggedPatterns.map((pattern: string, index: number) => (
                <li key={index}>{pattern}</li>
              ))}
            </ul>
          </div>
        )}
        
        {details.recommendation && (
          <div>
            <div className="font-medium">Recommendation:</div>
            <p>{details.recommendation}</p>
          </div>
        )}
        
        {details.similarCases && (
          <div>
            <div className="font-medium">Similar Cases:</div>
            <p>Found {details.similarCases} similar cases in our database</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="mb-5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          AI Fraud Detection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fraudScore === null ? (
          <div className="flex flex-col items-center py-4">
            <p className="text-center mb-4">
              Our AI model can analyze this transaction to detect potential fraud patterns.
            </p>
            <Button 
              onClick={analyzeTransactionHandler} 
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              {isAnalyzing ? (
                <>
                  <span className="mr-2">Analyzing</span>
                  <Progress value={70} className="w-10 h-2" />
                </>
              ) : (
                "Analyze Transaction"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <div className={`text-3xl font-bold ${getScoreColor()}`}>
                {fraudScore}%
              </div>
              <div className="text-sm text-muted-foreground">
                Fraud Probability Score
              </div>
              <div className="mt-2">
                {getVerdictBadge()}
              </div>
              {confidence !== null && (
                <div className="text-sm text-muted-foreground mt-1">
                  {confidence}% confidence
                </div>
              )}
            </div>
            
            <Progress 
              value={fraudScore} 
              className={`h-2 ${
                fraudScore < 30 ? "bg-success/20" : 
                fraudScore < 70 ? "bg-warning/20" : 
                "bg-destructive/20"
              }`}
            />
            
            <div className="text-sm">
              {aiVerdict === 'legitimate' && (
                <p>This transaction appears legitimate with no suspicious patterns detected.</p>
              )}
              {aiVerdict === 'suspicious' && (
                <p>This transaction has some unusual patterns that warrant further investigation.</p>
              )}
              {aiVerdict === 'fraudulent' && (
                <p>This transaction matches known fraud patterns and is highly likely to be fraudulent.</p>
              )}
              
              {getAnalysisDetails()}
            </div>
            
            {!feedbackSent && (
              <div className="pt-2 border-t">
                <p className="text-sm text-muted-foreground mb-2">Was this analysis helpful?</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => sendFeedback(true)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Yes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => sendFeedback(false)}
                  >
                    <ThumbsDown className="h-4 w-4 mr-1" />
                    No
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIFraudDetection;
