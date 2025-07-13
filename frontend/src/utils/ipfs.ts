import { PINATA_GATEWAY } from '../constants/pinata';

export const getIpfsUrl = (ipfsHash: string): string => {
  return `${PINATA_GATEWAY}${ipfsHash}`;
};

export const fetchJsonFromIpfs = async (ipfsHash: string): Promise<Record<string, unknown> | null> => {
  try {
    const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Check content type
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json") && !contentType.includes("text/plain")) {
      console.warn("IPFS content is not JSON format");
      return null;
    }
    
    const text = await response.text();
    
    // Validate content before parsing
    if (!text.trim() || text.trim().startsWith("%PDF") || text.trim().startsWith("<!DOCTYPE")) {
      console.warn("IPFS content appears to be non-JSON format (PDF, HTML, etc.)");
      return null;
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching JSON from IPFS:", error);
    return null;
  }
};