/**
 * Risk Agent
 * Validates producer whitelist status, daily caps, and performs AI-powered anomaly detection
 */

import { ethers } from 'ethers';

// Environment variables interface
interface Env {
  // Arc Network
  ARC_RPC_URL: string;
  AI_AGENT_PRIVATE_KEY: string;

  // Contract addresses
  REGISTRY_ADDRESS: string;
  MINTING_CONTROLLER_ADDRESS: string;

  // AI/ML APIs
  AIML_API_KEY: string;

  // Optional: Circle Compliance Engine
  CIRCLE_API_KEY?: string;
  CIRCLE_ENTITY_SECRET?: string;
}

// Request body interface
interface RiskCheckRequest {
  producerAddress: string;
  kwhAmount: number;
  historicalData?: {
    previousClaims: Array<{ kwh: number; timestamp: number }>;
    systemCapacity?: number;
    location?: string;
  };
}

// Registry ABI (partial)
const REGISTRY_ABI = [
  'function isWhitelisted(address _producer) external view returns (bool)',
  'function validateDailyProduction(address _producer, uint256 _kwhAmount) external view returns (bool isValid, string memory reason)',
  'function getProducer(address _producer) external view returns (tuple(bool isWhitelisted, uint256 systemCapacityKw, uint256 dailyCapKwh, uint256 totalMinted, uint256 lastMintTimestamp, string ipfsMetadata, uint256 registrationDate))',
];

// MintingController ABI (partial)
const MINTING_CONTROLLER_ABI = [
  'function triggerCircuitBreaker(string memory _reason) external',
  'function circuitBreakerTriggered() external view returns (bool)',
  'function getMintingStats() external view returns (uint256 todayMinted, uint256 dailyRemaining, uint256 allTimeMinted, bool breakerStatus)',
];

// AI-powered anomaly detection using AIML API
async function detectAnomalies(
  data: RiskCheckRequest,
  env: Env
): Promise<{ score: number; reason: string }> {
  try {
    if (!data.historicalData || !data.historicalData.previousClaims) {
      return { score: 0, reason: 'No historical data for comparison' };
    }

    // Prepare data for AI analysis
    const prompt = `Analyze the following solar energy generation pattern for anomalies:

Current Claim: ${data.kwhAmount} kWh
System Capacity: ${data.historicalData.systemCapacity || 'Unknown'} kW
Location: ${data.historicalData.location || 'Unknown'}

Historical Claims (last 30 days):
${data.historicalData.previousClaims
  .slice(-30)
  .map((claim, i) => `Day ${i + 1}: ${claim.kwh} kWh`)
  .join('\n')}

Analyze if the current claim is anomalous compared to historical patterns. Consider:
1. Is the claim significantly higher than the historical average?
2. Is there an unusual pattern or spike?
3. Does it exceed reasonable solar generation for the system capacity?

Respond with a JSON object: {"anomalous": boolean, "confidence": 0-1, "reason": "explanation"}`;

    const response = await fetch('https://api.aimlapi.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.AIML_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a fraud detection AI for solar energy generation claims. Respond only with valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('AIML API error:', response.statusText);
      return { score: 0, reason: 'AI analysis unavailable' };
    }

    const result = await response.json();
    const aiResponse = result.choices[0].message.content;

    // Parse AI response
    const analysis = JSON.parse(aiResponse);

    if (analysis.anomalous && analysis.confidence > 0.7) {
      return {
        score: analysis.confidence,
        reason: analysis.reason || 'AI detected suspicious pattern',
      };
    }

    return {
      score: 0,
      reason: 'AI analysis passed',
    };
  } catch (error) {
    console.error('Anomaly detection error:', error);
    return { score: 0, reason: 'AI analysis error (allowed to proceed)' };
  }
}

// Check wallet address using Circle Compliance Engine (if available)
async function checkCompliance(
  address: string,
  env: Env
): Promise<{ passed: boolean; reason: string }> {
  if (!env.CIRCLE_API_KEY || !env.CIRCLE_ENTITY_SECRET) {
    return { passed: true, reason: 'Compliance check skipped (no API key)' };
  }

  try {
    // Call Circle Compliance Engine API
    const response = await fetch('https://api.circle.com/v1/w3s/compliance/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({
        address,
        blockchain: 'ARC',
      }),
    });

    if (!response.ok) {
      console.error('Circle Compliance API error:', response.statusText);
      return { passed: true, reason: 'Compliance check unavailable' };
    }

    const result = await response.json();

    if (result.riskLevel === 'HIGH' || result.sanctioned) {
      return {
        passed: false,
        reason: `Compliance risk detected: ${result.riskReason || 'High risk'}`,
      };
    }

    return { passed: true, reason: 'Compliance check passed' };
  } catch (error) {
    console.error('Compliance check error:', error);
    return { passed: true, reason: 'Compliance check error (allowed to proceed)' };
  }
}

// Trigger circuit breaker
async function triggerCircuitBreaker(reason: string, env: Env): Promise<void> {
  try {
    const provider = new ethers.JsonRpcProvider(env.ARC_RPC_URL);
    const wallet = new ethers.Wallet(env.AI_AGENT_PRIVATE_KEY, provider);
    const mintingController = new ethers.Contract(
      env.MINTING_CONTROLLER_ADDRESS,
      MINTING_CONTROLLER_ABI,
      wallet
    );

    const tx = await mintingController.triggerCircuitBreaker(reason);
    await tx.wait();

    console.log('Circuit breaker triggered:', reason);
  } catch (error) {
    console.error('Failed to trigger circuit breaker:', error);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Parse request
      const data: RiskCheckRequest = await request.json();

      // Validate request
      if (!data.producerAddress || !data.kwhAmount) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: producerAddress, kwhAmount' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Connect to blockchain
      const provider = new ethers.JsonRpcProvider(env.ARC_RPC_URL);
      const registry = new ethers.Contract(env.REGISTRY_ADDRESS, REGISTRY_ABI, provider);

      // Check 1: Is producer whitelisted?
      const isWhitelisted = await registry.isWhitelisted(data.producerAddress);
      if (!isWhitelisted) {
        return new Response(
          JSON.stringify({
            approved: false,
            reason: 'Producer not whitelisted',
            risk: 'high',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check 2: Validate daily production limits
      const kwhAmountWei = ethers.parseUnits(data.kwhAmount.toString(), 18);
      const [isValid, reason] = await registry.validateDailyProduction(
        data.producerAddress,
        kwhAmountWei
      );

      if (!isValid) {
        return new Response(
          JSON.stringify({
            approved: false,
            reason: `Daily limit validation failed: ${reason}`,
            risk: 'medium',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check 3: Circle Compliance Engine
      const complianceCheck = await checkCompliance(data.producerAddress, env);
      if (!complianceCheck.passed) {
        // Trigger circuit breaker for compliance violations
        await triggerCircuitBreaker(
          `Compliance violation: ${complianceCheck.reason}`,
          env
        );

        return new Response(
          JSON.stringify({
            approved: false,
            reason: complianceCheck.reason,
            risk: 'critical',
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Check 4: AI-powered anomaly detection
      const anomalyScore = await detectAnomalies(data, env);

      if (anomalyScore.score > 0.8) {
        // High anomaly score - trigger circuit breaker
        await triggerCircuitBreaker(
          `AI detected anomaly (${anomalyScore.score.toFixed(2)}): ${anomalyScore.reason}`,
          env
        );

        return new Response(
          JSON.stringify({
            approved: false,
            reason: `Anomaly detected: ${anomalyScore.reason}`,
            risk: 'high',
            anomalyScore: anomalyScore.score,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Get producer details for response
      const producer = await registry.getProducer(data.producerAddress);

      // All checks passed
      return new Response(
        JSON.stringify({
          approved: true,
          reason: 'All risk checks passed',
          risk: 'low',
          checks: {
            whitelist: 'passed',
            dailyLimit: 'passed',
            compliance: complianceCheck.reason,
            anomalyDetection: anomalyScore.reason,
            anomalyScore: anomalyScore.score,
          },
          producerInfo: {
            systemCapacity: ethers.formatUnits(producer.systemCapacityKw, 0),
            dailyCap: ethers.formatUnits(producer.dailyCapKwh, 0),
            totalMinted: ethers.formatUnits(producer.totalMinted, 18),
          },
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (error: any) {
      console.error('Risk Agent error:', error);

      return new Response(
        JSON.stringify({
          error: 'Risk Agent failed',
          message: error.message,
          stack: error.stack,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
