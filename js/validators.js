// validators.js - Validation logic
import { CONFIG } from './config.js';
import { sanitize } from './helpers.js';

export const validators = {
  /**
   * Validation of the invoice amount
   */
  validateBillValueRaw(raw) {
    const cleaned = sanitize.decimal(raw);
    const num = parseFloat(cleaned);

    if (isNaN(num)) return { ok: false, reason: 'empty' };
    if (num < CONFIG.MIN_BILL) return { ok: false, reason: 'min' };
    if (num > CONFIG.MAX_BILL) return { ok: false, reason: 'max' };

    return { ok: true, value: parseFloat(num.toFixed(2)) };
  },

  /**
   * Validation of the number of people
   */
  validatePeopleValueRaw(raw) {
    const cleaned = sanitize.numeric(raw);
    const num = parseInt(cleaned);

    if (isNaN(num)) return { ok: false, reason: 'empty' };
    if (num < CONFIG.MIN_PEOPLE) return { ok: false, reason: 'min' };
    if (num > CONFIG.MAX_PEOPLE) return { ok: false, reason: 'max' };

    return { ok: true, value: num };
  },

  /**
   * Validating custom tips
   */
  validateCustomTipRaw(raw) {
    const num = parseFloat(sanitize.decimal(raw));

    if (isNaN(num)) return { ok: false };
    if (num < CONFIG.MIN_CUSTOM_TIP || num > CONFIG.MAX_CUSTOM_TIP) {
      return { ok: false };
    }

    return { ok: true, value: Math.round(num) };
  }
};