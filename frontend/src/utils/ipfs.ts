import { PINATA_GATEWAY } from '../constants/pinata';

export const getIpfsUrl = (ipfsHash: string): string => {
  return `${PINATA_GATEWAY}${ipfsHash}`;
};