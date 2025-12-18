/**
 * Formatting Utilities
 * =====================
 * Helper functions for formatting data for display.
 */

/**
 * Format a number with thousands separators
 */
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined) return '-';
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  return parsed.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a large number with abbreviations (K, M, B)
 */
export function formatCompactNumber(num) {
  if (num === null || num === undefined) return '-';
  const parsed = typeof num === 'string' ? parseFloat(num) : num;
  
  if (parsed >= 1_000_000_000) {
    return `${(parsed / 1_000_000_000).toFixed(2)}B`;
  }
  if (parsed >= 1_000_000) {
    return `${(parsed / 1_000_000).toFixed(2)}M`;
  }
  if (parsed >= 1_000) {
    return `${(parsed / 1_000).toFixed(2)}K`;
  }
  return parsed.toFixed(2);
}

/**
 * Format a token amount (e.g., HEALTH tokens)
 */
export function formatTokenAmount(amount, symbol = 'HEALTH', decimals = 2) {
  if (amount === null || amount === undefined) return '-';
  const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `${formatNumber(parsed, decimals)} ${symbol}`;
}

/**
 * Shorten an Ethereum address for display
 */
export function shortenAddress(address, chars = 4) {
  if (!address) return '-';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Shorten a transaction hash for display
 */
export function shortenHash(hash, chars = 6) {
  if (!hash) return '-';
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

/**
 * Format a timestamp to a readable date string
 */
export function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a timestamp to a readable date and time string
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '-';
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format a timestamp to relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(timestamp) {
  if (!timestamp) return '-';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

/**
 * Format a percentage value
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return `${parsed.toFixed(decimals)}%`;
}

/**
 * Format uptime (e.g., "99.5%")
 */
export function formatUptime(uptime) {
  return formatPercent(uptime);
}

/**
 * Get status color class based on status string
 */
export function getStatusClass(status) {
  const statusLower = status?.toLowerCase();
  switch (statusLower) {
    case 'active':
    case 'validated':
    case 'confirmed':
      return 'badge-active';
    case 'pending':
      return 'badge-pending';
    case 'inactive':
      return 'badge-inactive';
    case 'slashed':
    case 'rejected':
    case 'failed':
      return 'badge-error';
    default:
      return 'badge-inactive';
  }
}

/**
 * Format gas used to a more readable format
 */
export function formatGas(gasUsed, gasPrice) {
  if (!gasUsed) return '-';
  const cost = (gasUsed * gasPrice) / 1e9; // Assuming gasPrice is in gwei
  return `${formatNumber(gasUsed)} (${cost.toFixed(6)} ETH)`;
}

