/**
 * @file useLeadCapture.ts
 * @description Hook for handling lead capture form submission
 */

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';

interface LeadData {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
  calculationResult: any;
  source: string;
  creditAmount: number;
}

export function useLeadCapture() {
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (leadData: LeadData) => {
      setError(null);
      
      // Transform data to match backend expectations
      const requestData = {
        email: leadData.email,
        firstName: leadData.firstName, 
        lastName: leadData.lastName,
        company: leadData.companyName,
        phone: leadData.phone || '',
        source: leadData.source,
        calculationData: leadData.calculationResult
      };
      
      const response = await apiRequest('POST', '/api/leads/capture', requestData);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit lead');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Store lead ID in localStorage for continuity
      if (data.leadId) {
        localStorage.setItem('leadId', data.leadId);
        localStorage.setItem('leadEmail', data.email);
      }
      
      // Invalidate any relevant queries
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (err: Error) => {
      console.error('Lead capture error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  });

  const submitLead = async (leadData: LeadData): Promise<string> => {
    const result = await mutation.mutateAsync(leadData);
    return result.id || result.leadId || 'success';
  };

  return {
    submitLead,
    isSubmitting: mutation.isPending,
    error,
    isSuccess: mutation.isSuccess
  };
}