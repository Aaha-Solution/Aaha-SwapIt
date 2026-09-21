/**
 * Formats a number into Indian Rupee currency string (e.g. ₹4,50,000)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Truncate long strings with ellipsis
 */
export function truncate(str: string, length = 40): string {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * Generate unique IDs
 */
export function generateId(prefix = 'item'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
}
