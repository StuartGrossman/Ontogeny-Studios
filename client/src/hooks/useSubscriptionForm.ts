import { useState, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface UseSubscriptionFormProps {
  projectId?: string;
  projectName?: string;
  userId?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const validateSubscriptionAmount = (amount: string): ValidationResult => {
  const numAmount = parseFloat(amount);
  
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Please enter a subscription amount' };
  }
  
  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Please enter a valid number' };
  }
  
  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than $0' };
  }
  
  if (numAmount > 999999.99) {
    return { isValid: false, error: 'Amount cannot exceed $999,999.99' };
  }
  
  return { isValid: true };
};

export const useSubscriptionForm = ({
  projectId,
  projectName,
  userId,
  onSuccess,
  onError
}: UseSubscriptionFormProps) => {
  const [subscriptionAmount, setSubscriptionAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Validation state - only show errors after user has interacted
  const validation = validateSubscriptionAmount(subscriptionAmount);
  const shouldShowValidationError = hasInteracted && !validation.isValid;
  const isFormValid = validation.isValid && subscriptionAmount.trim() !== '';

  const handleAmountChange = useCallback((value: string) => {
    // Only allow numbers, decimal point, and backspace
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setSubscriptionAmount(value);
      setHasInteracted(true);
      setError(null); // Clear error when user starts typing
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!userId || !isFormValid) {
      const errorMessage = 'Please enter a valid subscription amount';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    const amount = parseFloat(subscriptionAmount);
    setConfirmedAmount(amount);
    setShowConfirmation(true);
    setError(null);
  }, [userId, isFormValid, subscriptionAmount, onError]);

  const handleConfirm = useCallback(async () => {
    if (!userId || !confirmedAmount || !projectId) {
      const errorMessage = 'Missing required data for subscription setup';
      setError(errorMessage);
      onError?.(errorMessage);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('Setting subscription amount for project:', {
        projectId,
        projectName,
        confirmedAmount
      });

      // Update project with subscription amount
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        subscriptionAmount: confirmedAmount,
        subscriptionCurrency: 'USD',
        subscriptionStatus: 'active',
        subscriptionSetupAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Project subscription amount updated successfully');

      // Reset form and call success callback
      setSubscriptionAmount('');
      setShowConfirmation(false);
      setConfirmedAmount(null);
      setError(null);
      setHasInteracted(false);
      onSuccess?.();
    } catch (err) {
      const errorMessage = 'Failed to setup subscription amount. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
      console.error('Error setting subscription amount:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, confirmedAmount, projectId, projectName, onSuccess, onError]);

  const handleBack = useCallback(() => {
    setShowConfirmation(false);
    setConfirmedAmount(null);
    setError(null);
  }, []);

  const resetForm = useCallback(() => {
    setSubscriptionAmount('');
    setError(null);
    setShowConfirmation(false);
    setConfirmedAmount(null);
    setHasInteracted(false);
  }, []);

  return {
    // State
    subscriptionAmount,
    isLoading,
    error,
    showConfirmation,
    confirmedAmount,
    validation: shouldShowValidationError ? validation : { isValid: true },
    isFormValid,
    
    // Actions
    handleAmountChange,
    handleSubmit,
    handleConfirm,
    handleBack,
    resetForm,
    
    // Computed values
    formattedAmount: confirmedAmount ? `$${confirmedAmount.toFixed(2)}` : '',
  };
}; 