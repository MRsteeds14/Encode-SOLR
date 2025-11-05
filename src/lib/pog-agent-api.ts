/**
 * PoG (Proof-of-Generation) Agent API Client
 * Handles communication with the Cloudflare Worker that validates and mints tokens
 */

// Request interface matching worker expectations
export interface GenerationRequest {
  producerAddress: string
  kwhGenerated: number
  timestamp: number
  metadata?: {
    location?: string
    systemCapacity?: number
    weatherConditions?: string
  }
}

// Response interface from PoG Agent
export interface GenerationResponse {
  success: boolean
  txHash: string
  ipfsProof: string
  mintedAmount: string
  nrelValidation?: string
  blockNumber?: number
  gasUsed?: string
  error?: string
  message?: string
  reason?: string
}

// Agent status for UI feedback
export interface AgentProcessingStatus {
  step: 'validating' | 'uploading' | 'minting' | 'confirming' | 'completed' | 'error'
  message: string
  progress: number
}

/**
 * PoG Agent API Client
 */
export class PogAgentAPI {
  private readonly baseUrl: string

  constructor(baseUrl?: string) {
    // Use environment variable or fallback to local dev
    this.baseUrl = baseUrl || import.meta.env.VITE_POG_AGENT_URL || 'http://localhost:8787'
  }

  /**
   * Submit energy generation for validation and minting
   */
  async submitGeneration(
    request: GenerationRequest,
    onProgress?: (status: AgentProcessingStatus) => void
  ): Promise<GenerationResponse> {
    try {
      // Step 1: Validating
      onProgress?.({
        step: 'validating',
        message: 'Validating producer whitelist and daily limits...',
        progress: 20,
      })

      // Make API call to PoG Agent
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      // Step 2: Processing response
      onProgress?.({
        step: 'uploading',
        message: 'Uploading proof to IPFS...',
        progress: 40,
      })

      const data: GenerationResponse = await response.json()

      // Check for errors
      if (!response.ok || !data.success) {
        onProgress?.({
          step: 'error',
          message: data.error || data.message || 'PoG Agent request failed',
          progress: 0,
        })

        throw new Error(data.error || data.message || `HTTP ${response.status}`)
      }

      // Step 3: Minting
      onProgress?.({
        step: 'minting',
        message: 'Calling MintingController contract...',
        progress: 60,
      })

      // Step 4: Confirming
      onProgress?.({
        step: 'confirming',
        message: 'Waiting for blockchain confirmation...',
        progress: 80,
      })

      // Step 5: Completed
      onProgress?.({
        step: 'completed',
        message: `Minted ${data.mintedAmount} sARC tokens successfully!`,
        progress: 100,
      })

      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'

      onProgress?.({
        step: 'error',
        message: errorMessage,
        progress: 0,
      })

      throw new Error(`PoG Agent error: ${errorMessage}`)
    }
  }

  /**
   * Health check - verify PoG Agent is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
      })
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance
export const pogAgentAPI = new PogAgentAPI()
