import { useCallback } from 'react';
import { toast } from 'sonner';
import { PINATA_API_KEY, PINATA_API_SECRET } from '../constants/pinata';

export const usePinata = () => {
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          pinata_api_key: PINATA_API_KEY,
          pinata_secret_api_key: PINATA_API_SECRET,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.IpfsHash) {
        toast.success('File uploaded to IPFS');
        return result.IpfsHash;
      } else {
        throw new Error('Failed to upload to IPFS');
      }
    } catch (error) {
      toast.error('Failed to upload to IPFS');
      throw error;
    }
  }, []);

  return { uploadFile };
};