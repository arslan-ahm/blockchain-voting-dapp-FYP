export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatDate = (timestamp: number): string => {
  if (timestamp === 0) return "Not set";
  return new Date(timestamp * 1000).toLocaleDateString();
};

export const dateToUnix = (dateString: string): number => {
  return dateString ? Math.floor(new Date(dateString).getTime() / 1000) : 0;
};

export const unixToDateInput = (timestamp: number): string => {
  if (timestamp === 0) return "";
  const date = new Date(timestamp * 1000);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};

export const getLinkDisplayName = (url: string): string => {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    const domain = parts.length > 2 ? parts[parts.length - 2] : parts[0];
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch {
    return "Link";
  }
};

export const formatUnixTimestamp = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};



/**
 * Generates relative time string from a given date
 * @param targetDate - The target date (can be Date object, timestamp in seconds, or milliseconds)
 * @param fromDate - The reference date (defaults to current date)
 * @returns Relative time string like "in 2 days", "after 1 week", "2 months ago", etc.
 */
export const getRelativeTime = (targetDate: Date | number, fromDate: Date = new Date()): string => {
  // Convert target date to Date object if it's a timestamp
  let target: Date;
  if (typeof targetDate === 'number') {
    // Check if it's in seconds (Unix timestamp) or milliseconds
    target = targetDate < 1e12 ? new Date(targetDate * 1000) : new Date(targetDate);
  } else {
    target = targetDate;
  }

  const now = fromDate;
  const diffMs = target.getTime() - now.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  const isInFuture = diffMs > 0;
  const absoluteDiff = Math.abs(diffMs);

  // Handle very small differences (less than 1 minute)
  if (absoluteDiff < 60000) {
    return "just now";
  }

  // Minutes
  if (absoluteDiff < 3600000) { // Less than 1 hour
    const minutes = Math.abs(diffMinutes);
    if (isInFuture) {
      return minutes === 1 ? "in 1 minute" : `in ${minutes} minutes`;
    } else {
      return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    }
  }

  // Hours
  if (absoluteDiff < 86400000) { // Less than 1 day
    const hours = Math.abs(diffHours);
    if (isInFuture) {
      return hours === 1 ? "in 1 hour" : `in ${hours} hours`;
    } else {
      return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    }
  }

  // Days
  if (absoluteDiff < 604800000) { // Less than 1 week
    const days = Math.abs(diffDays);
    if (isInFuture) {
      return days === 1 ? "tomorrow" : `in ${days} days`;
    } else {
      return days === 1 ? "yesterday" : `${days} days ago`;
    }
  }

  // Weeks
  if (absoluteDiff < 2592000000) { // Less than ~1 month (30 days)
    const weeks = Math.abs(diffWeeks);
    if (isInFuture) {
      return weeks === 1 ? "next week" : `in ${weeks} weeks`;
    } else {
      return weeks === 1 ? "last week" : `${weeks} weeks ago`;
    }
  }

  // Months
  if (absoluteDiff < 31536000000) { // Less than 1 year
    const months = Math.abs(diffMonths);
    if (isInFuture) {
      return months === 1 ? "next month" : `in ${months} months`;
    } else {
      return months === 1 ? "last month" : `${months} months ago`;
    }
  }

  // Years
  const years = Math.abs(diffYears);
  if (isInFuture) {
    return years === 1 ? "next year" : `in ${years} years`;
  } else {
    return years === 1 ? "last year" : `${years} years ago`;
  }
};

/**
 * Formats duration between two dates in a human-readable way
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Duration string like "2 days", "1 week 3 days", "1 month 2 weeks", etc.
 */
export const formatDuration = (startDate: Date | number, endDate: Date | number): string => {
  // Convert to Date objects if they're timestamps
  const start = typeof startDate === 'number' 
    ? (startDate < 1e12 ? new Date(startDate * 1000) : new Date(startDate))
    : startDate;
  
  const end = typeof endDate === 'number' 
    ? (endDate < 1e12 ? new Date(endDate * 1000) : new Date(endDate))
    : endDate;

  const diffMs = Math.abs(end.getTime() - start.getTime());
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // For very short durations
  if (diffMs < 60000) {
    return "less than a minute";
  }

  if (diffMs < 3600000) { // Less than 1 hour
    return diffMinutes === 1 ? "1 minute" : `${diffMinutes} minutes`;
  }

  if (diffMs < 86400000) { // Less than 1 day
    const hours = diffHours;
    const remainingMinutes = diffMinutes - (hours * 60);
    if (remainingMinutes === 0) {
      return hours === 1 ? "1 hour" : `${hours} hours`;
    }
    return `${hours}h ${remainingMinutes}m`;
  }

  if (diffMs < 604800000) { // Less than 1 week
    const days = diffDays;
    const remainingHours = diffHours - (days * 24);
    if (remainingHours === 0) {
      return days === 1 ? "1 day" : `${days} days`;
    }
    return `${days}d ${remainingHours}h`;
  }

  if (diffMs < 2592000000) { // Less than ~1 month
    const weeks = diffWeeks;
    const remainingDays = diffDays - (weeks * 7);
    if (remainingDays === 0) {
      return weeks === 1 ? "1 week" : `${weeks} weeks`;
    }
    return `${weeks}w ${remainingDays}d`;
  }

  // For longer durations
  const months = diffMonths;
  const remainingDays = diffDays - (months * 30);
  const remainingWeeks = Math.floor(remainingDays / 7);
  
  if (remainingWeeks === 0) {
    return months === 1 ? "1 month" : `${months} months`;
  }
  
  return `${months}m ${remainingWeeks}w`;
};

/**
 * Get relative time specifically for campaign dates with context
 * @param campaignDate - The campaign date (start or end)
 * @param type - Whether it's a start or end date
 * @returns Contextual relative time string
 */
export const getCampaignRelativeTime = (
  campaignDate: Date | number, 
  type: 'start' | 'end' = 'start'
): string => {
  const relativeTime = getRelativeTime(campaignDate);
  
  // Add context based on type
  if (type === 'start') {
    if (relativeTime.includes('ago')) {
      return `Started ${relativeTime}`;
    } else if (relativeTime === 'just now') {
      return 'Starting now';
    } else {
      return `Starts ${relativeTime}`;
    }
  } else {
    if (relativeTime.includes('ago')) {
      return `Ended ${relativeTime}`;
    } else if (relativeTime === 'just now') {
      return 'Ending now';
    } else {
      return `Ends ${relativeTime}`;
    }
  }
};