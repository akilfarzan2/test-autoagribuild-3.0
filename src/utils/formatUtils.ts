// Utility functions for formatting data

// Format currency values
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount);
};

// Format date for display
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not specified';
  return new Date(dateString).toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};