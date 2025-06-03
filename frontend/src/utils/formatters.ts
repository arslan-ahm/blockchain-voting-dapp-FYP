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