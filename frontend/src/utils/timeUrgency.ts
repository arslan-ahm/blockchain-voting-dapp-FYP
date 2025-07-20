// Helper function to determine urgency level based on time remaining
export const getTimeUrgencyLevel = (targetTimestamp: number) => {
  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = targetTimestamp - now;
  const totalHours = timeRemaining / (60 * 60);
  
  if (totalHours <= 0.5) return 'critical'; // Less than 30 minutes
  if (totalHours <= 2) return 'veryUrgent'; // Less than 2 hours  
  if (totalHours <= 5) return 'urgent'; // Less than 5 hours
  if (totalHours <= 12) return 'moderate'; // Less than 12 hours
  return 'normal'; // More than 12 hours
};

// Helper function to get color classes based on urgency level
export const getUrgencyColors = (urgencyLevel: string) => {
  switch (urgencyLevel) {
    case 'critical':
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/20',
        border: 'border-red-500'
      };
    case 'veryUrgent':
      return {
        text: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-400'
      };
    case 'urgent':
      return {
        text: 'text-orange-400',
        bg: 'bg-orange-500/10',
        border: 'border-orange-400'
      };
    case 'moderate':
      return {
        text: 'text-yellow-400',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-400'
      };
    default: // normal
      return {
        text: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-400'
      };
  }
};

// Type definitions for urgency levels
export type UrgencyLevel = 'critical' | 'veryUrgent' | 'urgent' | 'moderate' | 'normal';
