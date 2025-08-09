// utils/verificationUtils.ts

interface VerificationRequestData {
    requestedRole: "Voter" | "Candidate";
    bio?: string;
    supportiveLinks?: string[];
    documentHash: string;
    userAddress: string;
    name: string;
    email: string;
    dateOfBirth: number;
    identityNumber: string;
    contactNumber: string;
    profileImageIpfsHash?: string;
  }
  
  /**
   * Submit verification request - this would typically go to your backend API
   * or directly to the smart contract via the Redux thunk
   */
  export const submitVerificationRequest = async (data: VerificationRequestData) => {
    try {
      // If you have a backend API for verification requests:
      /*
      const response = await fetch('/api/verification/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit verification request');
      }
      
      return await response.json();
      */
      
      // For now, we'll just log the data since the actual submission
      // should be handled by the Redux thunk (requestVerification)
      console.log('Verification request data:', data);
      
      // The actual smart contract interaction should be handled by
      // the requestVerification thunk which is already implemented
      return { success: true, message: 'Verification request prepared' };
      
    } catch (error) {
      console.error('Error in submitVerificationRequest:', error);
      throw error;
    }
  };
  
  /**
   * Validate verification request data before submission
   */
  export const validateVerificationRequest = (data: Partial<VerificationRequestData>) => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push('Name is required');
    }
    
    if (!data.email?.trim()) {
      errors.push('Email is required');
    }
    
    if (!data.dateOfBirth) {
      errors.push('Date of birth is required');
    }
    
    if (!data.identityNumber?.trim()) {
      errors.push('Identity number is required');
    }
    
    if (!data.contactNumber?.trim()) {
      errors.push('Contact number is required');
    }
    
    if (!data.requestedRole) {
      errors.push('Requested role is required');
    }
    
    if (!data.userAddress?.trim()) {
      errors.push('User address is required');
    }
    
    // Validate email format
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Invalid email format');
    }
    
    // Validate supportive links if provided
    if (data.supportiveLinks && data.supportiveLinks.length > 0) {
      const urlRegex = /^https?:\/\/.+/;
      for (const link of data.supportiveLinks) {
        if (link.trim() && !urlRegex.test(link)) {
          errors.push('Invalid URL in supportive links');
          break;
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };