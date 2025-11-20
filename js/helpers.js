// helpers.js - General-purpose utilities

/**
 * Debounce function - postpones execution
 * @param {Function} func - Function to execute
 * @param {number} wait - Delay in milliseconds
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize - Input cleaning
 */
export const sanitize = {
  numeric: (str) => String(str).replace(/[^0-9]/g, ''),
  decimal: (str) => String(str).replace(/[^0-9.]/g, '')
};