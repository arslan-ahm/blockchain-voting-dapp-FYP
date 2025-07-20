// Pinata IPFS Configuration
export const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
export const PINATA_API_SECRET = import.meta.env.VITE_PINATA_API_SECRET;
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
export const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/";

// Validation helper for Pinata configuration
export const validatePinataConfig = () => {
  if (!PINATA_API_KEY || !PINATA_API_SECRET) {
    throw new Error('Pinata API key and secret are required for IPFS uploads');
  }
  return true;
};