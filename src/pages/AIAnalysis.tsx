
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/AppHeader';

const AIAnalysis = () => {
  const [analysisData, setAnalysisData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentChain, setCurrentChain] = useState<'ethereum' | 'polygon'>('ethereum');

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    setIsLoading(true);
    try {
      // Fetch analysis data from Supabase
      const { data, error } = await supabase
        .from('transaction_ai_analysis')
        .select(`
          *,
          transactions:transaction_id (
            sender, 
            receiver, 
            amount,
            currency,
            timestamp,
            status,
            risk_level
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAnalysisData(data || []);
    } catch (error) {
      console.error('Error fetching analysis data:', error);
      // For demo, set mock data
      setAnalysisData([
        { id: '1', fraud_score: 15, verdict: 'legitimate', confidence: 95 },
        { id: '2', fraud_score: 45, verdict: 'suspicious', confidence: 78 },
        { id: '3', fraud_score: 85, verdict: 'fraudulent', confidence: 92 },
        { id: '4', fraud_score: 22, verdict: 'legitimate', confidence: 88 },
        { id: '5', fraud_score: 67, verdict: 'suspicious', confidence: 75 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const fraudScoreDistribution = [
    { name: 'Low Risk (0-30)', count: analysisData.filter(a => a.fraud_score < 30).length },
    { name: 'Medium Risk (30-70)', count: analysisData.filter(a => a.fraud_score >= 30 && a.fraud_score < 70).length },
    { name: 'High Risk (70-100)', count: analysisData.filter(a => a.fraud_score >= 70).length },
  ];

  const verdictDistribution = [
    { name: 'Legitimate', value: analysisData.filter(a => a.verdict === 'legitimate').length },
    { name: 'Suspicious', value: analysisData.filter(a => a.verdict === 'suspicious').length },
    { name: 'Fraudulent', value: analysisData.filter(a => a.verdict === 'fraudulent').length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppHeader 
        walletAddress="0x1234...5678"
        onWalletConnect={() => {}}
        currentChain={currentChain}
        onChainChange={setCurrentChain}
      />
      
      <main className="container mx-auto px-4 pt-6 pb-12 flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI Analysis Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of AI fraud detection analysis results
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchAnalysisData}>
              Refresh Data
            </Button>
            <Button asChild>
              <Link to="/transactions">Transaction History</Link>
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Analysis Count</CardTitle>
              <CardDescription>Total transactions analyzed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{analysisData.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Average Fraud Score</CardTitle>
              <CardDescription>Across all analyzed transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analysisData.length > 0 
                  ? Math.round(analysisData.reduce((acc, curr) => acc + curr.fraud_score, 0) / analysisData.length) 
                  : 0}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Flagged Transactions</CardTitle>
              <CardDescription>Suspicious or fraudulent verdicts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analysisData.filter(a => a.verdict !== 'legitimate').length}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 mb-6">
          <Tabs defaultValue="distribution">
            <TabsList className="mb-4">
              <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
              <TabsTrigger value="verdict">Verdict Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="distribution">
              <Card>
                <CardHeader>
                  <CardTitle>Fraud Score Distribution</CardTitle>
                  <CardDescription>Distribution of risk scores across analyzed transactions</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={fraudScoreDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="verdict">
              <Card>
                <CardHeader>
                  <CardTitle>AI Verdict Distribution</CardTitle>
                  <CardDescription>Breakdown of AI analysis verdicts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={verdictDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {verdictDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent AI Analysis Results</CardTitle>
            <CardDescription>Latest transaction analysis performed by our AI model</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : analysisData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Fraud Score</th>
                      <th className="text-left py-3 px-4">Verdict</th>
                      <th className="text-left py-3 px-4">Confidence</th>
                      <th className="text-left py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisData.map((analysis) => (
                      <tr key={analysis.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 text-sm">
                          {new Date(analysis.analysis_time || analysis.created_at).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className={`font-medium ${
                            analysis.fraud_score < 30 ? 'text-success' : 
                            analysis.fraud_score < 70 ? 'text-warning' : 
                            'text-destructive'
                          }`}>
                            {analysis.fraud_score}%
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`
                            ${analysis.verdict === 'legitimate' ? 'bg-success/20 text-success' : 
                              analysis.verdict === 'suspicious' ? 'bg-warning/20 text-warning' : 
                              'bg-destructive/20 text-destructive'}
                          `}>
                            {analysis.verdict.charAt(0).toUpperCase() + analysis.verdict.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">{analysis.confidence}%</td>
                        <td className="py-3 px-4">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/transactions?id=${analysis.transaction_id}`}>
                              View Transaction
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-lg text-muted-foreground">No analysis data available</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link to="/transactions">Analyze Transactions</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <footer className="py-4 px-6 border-t border-border text-center text-sm text-muted-foreground">
        <p>Blockchain Fraud Detection System - BlockFraud © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default AIAnalysis;
