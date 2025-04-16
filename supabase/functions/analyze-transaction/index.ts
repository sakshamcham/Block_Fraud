
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://mzltzlpklqrqcnooaksg.supabase.co';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bHR6bHBrbHFycWNub29ha3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3ODQwOTQsImV4cCI6MjA2MDM2MDA5NH0.wM1PPKor-N-TbD_ucmPDySN_PSZo7pTOQ_diH77IiSo';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transaction } = await req.json();
    console.log("Transaction to analyze:", transaction);

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create AI prompt for analysis
    const prompt = `
      Analyze this blockchain transaction for potential fraud:
      - Sender: ${transaction.sender}
      - Receiver: ${transaction.receiver}
      - Amount: ${transaction.amount} ${transaction.currency}
      - Transaction status: ${transaction.status}
      - Risk level indicated: ${transaction.riskLevel}
      - Location data: ${JSON.stringify(transaction.location || {})}
      - Transaction metadata: ${JSON.stringify(transaction.metadata || {})}
      
      Based on the data provided, analyze this transaction for fraudulent patterns. 
      Consider factors like transaction amount, parties involved, location, and any unusual patterns.
      Provide:
      1. A fraud score from 0-100 (higher means more likely fraudulent)
      2. A verdict: "legitimate", "suspicious", or "fraudulent"
      3. A confidence level from 0-100
      4. Brief explanation of the analysis
      
      Format your response as valid JSON with the following keys: fraudScore, verdict, confidence, details.
    `;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a blockchain fraud detection AI. You analyze transaction data and detect potential fraud patterns. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    // Process OpenAI response
    const openAIData = await response.json();
    console.log("OpenAI response:", openAIData);

    if (!openAIData.choices || !openAIData.choices[0]) {
      throw new Error('Invalid response from OpenAI');
    }

    const aiResponseText = openAIData.choices[0].message.content;
    console.log("AI response text:", aiResponseText);
    
    // Extract JSON from AI response
    let aiAnalysis;
    try {
      // Try to parse the entire response as JSON first
      aiAnalysis = JSON.parse(aiResponseText);
    } catch (e) {
      // If that fails, try to extract JSON using regex
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error('Could not parse AI response as JSON');
        }
      } else {
        throw new Error('Could not extract JSON from AI response');
      }
    }

    // Ensure we have the required fields
    const fraudScore = parseInt(aiAnalysis.fraudScore) || 0;
    const verdict = aiAnalysis.verdict || 'legitimate';
    const confidence = parseInt(aiAnalysis.confidence) || 0;
    const details = aiAnalysis.details || {};

    // Save analysis to database if we have a transaction ID
    if (transaction.id) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false },
      });

      // Get auth token from request
      const authHeader = req.headers.get('Authorization');
      const token = authHeader?.split(' ')[1];
      
      // If we have a token, set it for the Supabase client
      if (token) {
        supabase.auth.setSession({ access_token: token, refresh_token: '' });
      }

      // Store the analysis in the database
      const { data, error } = await supabase
        .from('transaction_ai_analysis')
        .insert({
          transaction_id: transaction.id,
          fraud_score: fraudScore,
          verdict: verdict,
          confidence: confidence,
          details: details
        });

      if (error) {
        console.error("Error storing analysis:", error);
      } else {
        console.log("Analysis stored:", data);
      }
    }

    // Return the analysis
    return new Response(
      JSON.stringify({
        transactionId: transaction.id,
        fraudScore,
        verdict,
        confidence,
        details
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-transaction function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
