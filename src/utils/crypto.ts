
/**
 * Utility functions for cryptographic operations
 */

/**
 * Creates a SHA-256 hash of the input string
 * 
 * @param message - The string to hash
 * @returns A Promise that resolves to the hash as a hex string
 */
export const sha256 = async (message: string): Promise<string> => {
  // Encode message as UTF-8
  const msgBuffer = new TextEncoder().encode(message);
  
  // Hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
};

/**
 * Formats a hash to display a shortened version with ellipsis
 * 
 * @param hash - The full hash string
 * @param prefixLength - Number of characters to show at the beginning
 * @param suffixLength - Number of characters to show at the end
 * @returns Formatted hash string with ellipsis in the middle
 */
export const formatHash = (hash: string, prefixLength = 6, suffixLength = 6): string => {
  if (!hash || hash.length <= prefixLength + suffixLength) {
    return hash || '';
  }
  
  const prefix = hash.substring(0, prefixLength);
  const suffix = hash.substring(hash.length - suffixLength);
  
  return `${prefix}...${suffix}`;
};

/**
 * Verifies a cryptographic signature against a message and public key
 * (Placeholder implementation)
 */
export const verifySignature = async (
  message: string,
  signature: string,
  publicKey: string
): Promise<boolean> => {
  // In a real implementation, this would verify a cryptographic signature
  // This is just a placeholder that always returns true
  return true;
};

/**
 * Generate a nonce for cryptographic operations
 */
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

