import { renderHook, act } from '@testing-library/react';
import { useSubscriptionForm } from '../useSubscriptionForm';

// Mock Firebase
jest.mock('../../firebase', () => ({
  db: {},
}));

// Mock Firestore functions
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  updateDoc: jest.fn(),
}));

describe('useSubscriptionForm', () => {
  const mockProps = {
    projectId: 'test-project-id',
    projectName: 'Test Project',
    userId: 'test-user-id',
    onSuccess: jest.fn(),
    onError: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    expect(result.current.subscriptionAmount).toBe('');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.showConfirmation).toBe(false);
    expect(result.current.confirmedAmount).toBeNull();
    expect(result.current.isFormValid).toBe(false);
  });

  it('should validate empty amount', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('');
    });

    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.error).toBe('Please enter a subscription amount');
  });

  it('should validate invalid number', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('abc');
    });

    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.error).toBe('Please enter a valid number');
  });

  it('should validate zero amount', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('0');
    });

    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.error).toBe('Amount must be greater than $0');
  });

  it('should validate amount too high', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('1000000');
    });

    expect(result.current.validation.isValid).toBe(false);
    expect(result.current.validation.error).toBe('Amount cannot exceed $999,999.99');
  });

  it('should validate valid amount', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('99.99');
    });

    expect(result.current.validation.isValid).toBe(true);
    expect(result.current.validation.error).toBeUndefined();
    expect(result.current.isFormValid).toBe(true);
  });

  it('should handle amount change with valid input', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('50.00');
    });

    expect(result.current.subscriptionAmount).toBe('50.00');
    expect(result.current.error).toBeNull();
  });

  it('should handle amount change with invalid input', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('50.123'); // Too many decimal places
    });

    expect(result.current.subscriptionAmount).toBe('50.12'); // Should be truncated
  });

  it('should handle back navigation', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    // First set up confirmation state
    act(() => {
      result.current.handleAmountChange('50.00');
      result.current.handleSubmit();
    });

    expect(result.current.showConfirmation).toBe(true);
    expect(result.current.confirmedAmount).toBe(50);

    // Then go back
    act(() => {
      result.current.handleBack();
    });

    expect(result.current.showConfirmation).toBe(false);
    expect(result.current.confirmedAmount).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should reset form', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    // Set up some state
    act(() => {
      result.current.handleAmountChange('50.00');
    });

    expect(result.current.subscriptionAmount).toBe('50.00');

    // Reset form
    act(() => {
      result.current.resetForm();
    });

    expect(result.current.subscriptionAmount).toBe('');
    expect(result.current.error).toBeNull();
    expect(result.current.showConfirmation).toBe(false);
    expect(result.current.confirmedAmount).toBeNull();
  });

  it('should format amount correctly', () => {
    const { result } = renderHook(() => useSubscriptionForm(mockProps));

    act(() => {
      result.current.handleAmountChange('99.99');
      result.current.handleSubmit();
    });

    expect(result.current.formattedAmount).toBe('$99.99');
  });
}); 